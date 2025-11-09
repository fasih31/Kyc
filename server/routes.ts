import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Router } from 'express';
import { db } from './db';
import { verifications, users, documents } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import multer from 'multer';
import { AIVerificationOrchestrator } from './ai';

const upload = multer({ storage: multer.memoryStorage() });
const aiOrchestrator = new AIVerificationOrchestrator();

// Initialize AI on startup
aiOrchestrator.initialize().catch(console.error);

export const router = Router();

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

// Add other AI-related routes as needed (e.g., risk scoring)

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  app.use('/api', router); // Mount the AI verification router

  const httpServer = createServer(app);

  return httpServer;
}