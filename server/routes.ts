import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Router } from 'express';
import { db } from './db';
import { verifications, users, documents } from '@shared/schema';
import { eq, desc, and, gte, lte, lt } from 'drizzle-orm';
import multer from 'multer';
import { AIVerificationOrchestrator } from './ai';
import { IdentityWalletService } from './services/identityWallet';
import { PrivacyService } from './services/privacyService';
import { APIIntegrationService } from './services/apiIntegration';
import { MonitoringService } from './services/monitoringService';
import { ComplianceService } from './services/complianceService';
import { OrganizationService } from "./services/organizationService";

const upload = multer({ storage: multer.memoryStorage() });
const aiOrchestrator = new AIVerificationOrchestrator();
const walletService = new IdentityWalletService();
const privacyService = new PrivacyService();
const apiService = new APIIntegrationService();
const monitoringService = new MonitoringService();
const complianceService = new ComplianceService();

import { AuthService } from './services/authService';
const authService = new AuthService();
const orgService = new OrganizationService();

// Initialize AI on startup
aiOrchestrator.initialize().catch(console.error);

// Run monitoring tasks
setInterval(() => {
  monitoringService.checkDocumentExpiry().catch(console.error);
}, 24 * 60 * 60 * 1000); // Daily check

export const router = Router();

// Authentication routes
router.post('/auth/send-otp', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    
    if (!mobileNumber) {
      return res.status(400).json({ message: 'Mobile number is required' });
    }

    const result = await authService.sendOTP(mobileNumber);
    res.json(result);
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    
    if (!mobileNumber || !otp) {
      return res.status(400).json({ message: 'Mobile number and OTP are required' });
    }

    const result = await authService.verifyOTP(mobileNumber, otp);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/auth/setup-face', upload.single('face'), async (req, res) => {
  try {
    const { userId } = req.body;
    const faceFile = req.file;

    if (!userId || !faceFile) {
      return res.status(400).json({ message: 'User ID and face image are required' });
    }

    const result = await authService.setupFaceVerification(userId, faceFile.buffer);
    res.json(result);
  } catch (error) {
    console.error('Setup face error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/auth/verify-face', upload.single('face'), async (req, res) => {
  try {
    const { token } = req.body;
    const faceFile = req.file;

    if (!token || !faceFile) {
      return res.status(400).json({ message: 'Token and face image are required' });
    }

    const result = await authService.verifyFaceLogin(token, faceFile.buffer);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json({ message: result.message });
    }
  } catch (error) {
    console.error('Verify face error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/auth/validate-session', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const result = await authService.validateSession(token);
    res.json(result);
  } catch (error) {
    console.error('Validate session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/verify-document', upload.fields([{ name: 'document' }, { name: 'selfie' }]), async (req, res) => {
  try {
    const { userId } = req.body; // Assuming userId is passed in the body
    const documentFile = (req.files as any)?.document?.[0];
    const selfieFile = (req.files as any)?.selfie?.[0];

    if (!userId || !documentFile || !selfieFile) {
      return res.status(400).json({ message: 'userId, document, and selfie are required' });
    }

    const documentBuffer = documentFile.buffer;
    const selfieBuffer = selfieFile.buffer;

    const result = await aiOrchestrator.verifyDocumentAndSelfie(userId, documentBuffer, selfieBuffer);

    // Save verification result to the database
    await db.insert(verifications).values({
      userId: userId,
      status: result.status,
      details: result.details,
      createdAt: new Date(),
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('AI Verification Error:', error);
    res.status(500).json({ message: 'Internal server error during AI verification' });
  }
});

router.post('/liveness-check', upload.single('video'), async (req, res) => {
  try {
    const { userId } = req.body;
    const videoFile = req.file;

    if (!userId || !videoFile) {
      return res.status(400).json({ message: 'userId and video are required' });
    }

    const videoBuffer = videoFile.buffer;

    const result = await aiOrchestrator.performLivenessCheck(userId, videoBuffer);

    // Update verification status or create a new one
    // For simplicity, let's assume we update the latest verification
    const latestVerification = await db.query.verifications.findFirst({
      where: eq(verifications.userId, userId),
      orderBy: desc(verifications.createdAt),
    });

    if (latestVerification) {
      await db.update(verifications).set({
        livenessStatus: result.status,
        livenessDetails: result.details,
      }).where(eq(verifications.id, latestVerification.id));
    } else {
      // If no previous verification, create a new one
      await db.insert(verifications).values({
        userId: userId,
        livenessStatus: result.status,
        livenessDetails: result.details,
        createdAt: new Date(),
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Liveness Check Error:', error);
    res.status(500).json({ message: 'Internal server error during liveness check' });
  }
});

// Privacy & Consent endpoints
router.post('/privacy/grant-consent', async (req, res) => {
  try {
    const { userId, consentType, purpose, dataScope, grantedTo, expiresAt } = req.body;
    const consent = await privacyService.grantConsent(userId, consentType, purpose, dataScope, grantedTo, expiresAt);
    res.json(consent);
  } catch (error) {
    console.error('Grant consent error:', error);
    res.status(500).json({ message: 'Error granting consent' });
  }
});

router.post('/privacy/revoke-consent', async (req, res) => {
  try {
    const { userId, consentId } = req.body;
    await privacyService.revokeConsent(userId, consentId);
    res.json({ success: true });
  } catch (error) {
    console.error('Revoke consent error:', error);
    res.status(500).json({ message: 'Error revoking consent' });
  }
});

// Digital Wallet endpoints
router.post('/wallet/create-credential', async (req, res) => {
  try {
    const { userId, credentialType, data, issuedBy, expiresAt } = req.body;
    const credential = await walletService.createCredential(userId, credentialType, data, issuedBy, expiresAt);
    res.json(credential);
  } catch (error) {
    console.error('Create credential error:', error);
    res.status(500).json({ message: 'Error creating credential' });
  }
});

router.get('/wallet/credentials/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const credentials = await walletService.getCredentials(userId);
    res.json(credentials);
  } catch (error) {
    console.error('Get credentials error:', error);
    res.status(500).json({ message: 'Error fetching credentials' });
  }
});

// Monitoring & Alerts endpoints
router.get('/monitoring/alerts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const alerts = await monitoringService.getUnreadAlerts(userId);
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Error fetching alerts' });
  }
});

router.post('/monitoring/detect-fraud', async (req, res) => {
  try {
    const { userId, verificationId, fraudType, severity, detectionMethod, confidenceScore, evidenceData } = req.body;
    const log = await monitoringService.detectFraud(userId, verificationId, fraudType, severity, detectionMethod, confidenceScore, evidenceData);
    res.json(log);
  } catch (error) {
    console.error('Fraud detection error:', error);
    res.status(500).json({ message: 'Error detecting fraud' });
  }
});

// API Integration endpoints
router.post('/api/share-verification', async (req, res) => {
  try {
    const { userId, clientId } = req.body;
    const hasConsent = await privacyService.checkConsent(userId, 'third_party_sharing');

    if (!hasConsent) {
      return res.status(403).json({ message: 'User consent required' });
    }

    const data = await apiService.shareVerificationStatus(userId, clientId);

    await apiService.logAPIAccess(
      clientId,
      userId,
      '/api/share-verification',
      'POST',
      req.body,
      200,
      data.trustScore,
      req.ip || '',
      req.headers['user-agent'] || ''
    );

    res.json(data);
  } catch (error) {
    console.error('Share verification error:', error);
    res.status(500).json({ message: 'Error sharing verification' });
  }
});

// Compliance endpoints
router.get('/compliance/report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await complianceService.generateComplianceReport(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json(report);
  } catch (error) {
    console.error('Compliance report error:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.use('/api', router); // Mount the AI verification router

  // AI capabilities endpoint
  app.get("/api/ai-capabilities", async (req, res) => {
    try {
      res.json({
        faceVerification: true,
        documentVerification: true,
        riskScoring: true,
        fingerprintVerification: true,
        voiceVerification: true,
        behavioralAnalytics: true,
        syntheticIdentityDetection: true,
        blockchainAudit: true
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Organization management endpoints
  app.post("/api/organization", async (req, res) => {
    try {
      const { name, industry, kycConfig } = req.body;
      const org = await orgService.createOrganization(name, industry, kycConfig);
      res.json(org);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/organization/:orgId/members", async (req, res) => {
    try {
      const members = await orgService.getOrganizationMembers(req.params.orgId);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/organization/member/:userId/role", async (req, res) => {
    try {
      const { newRole, requestingUserRole } = req.body;
      const user = await orgService.updateMemberRole(
        parseInt(req.params.userId),
        newRole,
        requestingUserRole
      );
      res.json(user);
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  });

  app.delete("/api/organization/member/:userId", async (req, res) => {
    try {
      const { requestingUserRole } = req.body;
      await orgService.removeMember(parseInt(req.params.userId), requestingUserRole);
      res.json({ success: true });
    } catch (error: any) {
      res.status(403).json({ error: error.message });
    }
  });

  app.get("/api/organization/check-permission/:userId/:permission", async (req, res) => {
    try {
      const hasAccess = await orgService.checkPermission(
        parseInt(req.params.userId),
        req.params.permission as any
      );
      res.json({ hasPermission: hasAccess });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/organization/:orgId", async (req, res) => {
    try {
      const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, req.params.orgId),
      });
      if (!org) {
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json(org);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/organization/:orgId/kyc-config", async (req, res) => {
    try {
      const { kycConfig, requestingUserRole } = req.body;
      
      // Check permissions
      if (requestingUserRole !== 'super_admin' && requestingUserRole !== 'admin') {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      const [updated] = await db.update(organizations)
        .set({ 
          kycConfig,
          updatedAt: new Date()
        })
        .where(eq(organizations.id, req.params.orgId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}