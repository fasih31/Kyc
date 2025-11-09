import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./services/aiService";
import { fileService } from "./services/fileService";
import multer from "multer";
import { insertVerificationSchema, insertDocumentSchema, insertAuditLogSchema } from "@shared/schema";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/verifications/start", async (req, res) => {
    try {
      const { userId, userName, documentType } = req.body;
      
      const verification = await storage.createVerification({
        userId: userId || 'demo-user',
        userName,
        documentType,
        status: 'pending',
        riskScore: null,
        documentData: null,
        biometricData: null,
        flaggedReasons: null,
      });

      await storage.createAuditLog({
        verificationId: verification.id,
        action: 'verification_started',
        performedBy: userId || 'demo-user',
        details: { documentType }
      });

      res.json({ success: true, verificationId: verification.id });
    } catch (error) {
      console.error('Start verification error:', error);
      res.status(500).json({ error: 'Failed to start verification' });
    }
  });

  app.post("/api/verifications/:id/upload-document", upload.single('document'), async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No document file provided' });
      }

      const base64Document = req.file.buffer.toString('base64');
      
      const ocrResult = await aiService.analyzeDocument(base64Document);
      
      if (!ocrResult.success) {
        return res.status(400).json({ error: 'Failed to analyze document', details: ocrResult.error });
      }

      const documentUrl = await fileService.saveFile(base64Document, 'document');

      await storage.createDocument({
        verificationId: id,
        documentUrl,
        selfieUrl: null,
        documentNumber: ocrResult.extractedData?.documentNumber || null,
        expiryDate: ocrResult.extractedData?.expiryDate || null,
        extractedData: ocrResult.extractedData || {}
      });

      await storage.updateVerification(id, {
        documentData: ocrResult.extractedData || {},
        status: 'document_uploaded'
      });

      await storage.createAuditLog({
        verificationId: id,
        action: 'document_uploaded',
        performedBy: 'user',
        details: { ocrConfidence: ocrResult.confidence }
      });

      res.json({ 
        success: true, 
        extractedData: ocrResult.extractedData,
        confidence: ocrResult.confidence
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({ error: 'Failed to process document' });
    }
  });

  app.post("/api/verifications/:id/upload-selfie", upload.single('selfie'), async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No selfie file provided' });
      }

      const verification = await storage.getVerification(id);
      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(400).json({ error: 'Document must be uploaded first' });
      }

      const base64Selfie = req.file.buffer.toString('base64');
      const selfieUrl = await fileService.saveFile(base64Selfie, 'selfie');

      const faceMatchResult = await aiService.compareFaces(
        base64Selfie,
        base64Selfie
      );

      if (!faceMatchResult.success) {
        return res.status(400).json({ error: 'Failed to analyze selfie', details: faceMatchResult.error });
      }

      const riskScore = await aiService.calculateRiskScore(
        { success: true, extractedData: verification.documentData as any, confidence: 0.85 },
        faceMatchResult
      );

      const fraudAnalysis = await aiService.detectFraud(
        verification.documentData,
        {
          matchScore: faceMatchResult.matchScore,
          isLivenessDetected: faceMatchResult.isLivenessDetected
        }
      );

      await storage.updateVerification(id, {
        biometricData: {
          matchScore: faceMatchResult.matchScore,
          isLivenessDetected: faceMatchResult.isLivenessDetected,
          confidence: faceMatchResult.confidence
        },
        riskScore,
        status: fraudAnalysis.isFraudulent ? 'flagged' : (riskScore >= 80 ? 'verified' : 'review'),
        flaggedReasons: fraudAnalysis.flaggedReasons.length > 0 ? fraudAnalysis.flaggedReasons : null
      });

      await storage.createAuditLog({
        verificationId: id,
        action: 'selfie_uploaded',
        performedBy: 'user',
        details: { 
          matchScore: faceMatchResult.matchScore,
          riskScore,
          status: fraudAnalysis.isFraudulent ? 'flagged' : 'verified'
        }
      });

      res.json({ 
        success: true, 
        riskScore,
        matchScore: faceMatchResult.matchScore,
        status: fraudAnalysis.isFraudulent ? 'flagged' : (riskScore >= 80 ? 'verified' : 'review')
      });
    } catch (error) {
      console.error('Upload selfie error:', error);
      res.status(500).json({ error: 'Failed to process selfie' });
    }
  });

  app.get("/api/verifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const verification = await storage.getVerification(id);
      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      const document = await storage.getDocument(id);
      const auditLogs = await storage.getAuditLogs(id);

      res.json({ 
        verification,
        document,
        auditLogs
      });
    } catch (error) {
      console.error('Get verification error:', error);
      res.status(500).json({ error: 'Failed to get verification' });
    }
  });

  app.get("/api/verifications", async (req, res) => {
    try {
      const { status, userId } = req.query;
      
      const verifications = await storage.listVerifications({
        status: status as string,
        userId: userId as string
      });

      res.json({ verifications });
    } catch (error) {
      console.error('List verifications error:', error);
      res.status(500).json({ error: 'Failed to list verifications' });
    }
  });

  app.patch("/api/verifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      const updated = await storage.updateVerification(id, { status });
      
      if (!updated) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      await storage.createAuditLog({
        verificationId: id,
        action: 'status_updated',
        performedBy: 'admin',
        details: { newStatus: status, notes }
      });

      res.json({ success: true, verification: updated });
    } catch (error) {
      console.error('Update verification error:', error);
      res.status(500).json({ error: 'Failed to update verification' });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const allVerifications = await storage.listVerifications();
      
      const stats = {
        total: allVerifications.length,
        verified: allVerifications.filter(v => v.status === 'verified').length,
        pending: allVerifications.filter(v => v.status === 'pending').length,
        flagged: allVerifications.filter(v => v.status === 'flagged').length,
        review: allVerifications.filter(v => v.status === 'review').length
      };

      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
