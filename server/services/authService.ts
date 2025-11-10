
import { db } from '../db';
import { users, otpVerifications, loginSessions } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';
import { FaceVerificationAI } from '../ai/faceVerification';

const faceAI = new FaceVerificationAI();

export class AuthService {
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendOTP(mobileNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Clean mobile number format
      const cleanedNumber = mobileNumber.replace(/\D/g, '');
      
      // Generate 6-digit OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Delete any existing OTPs for this number
      await db.delete(otpVerifications)
        .where(eq(otpVerifications.mobileNumber, cleanedNumber));

      // Store new OTP
      await db.insert(otpVerifications).values({
        mobileNumber: cleanedNumber,
        otp,
        expiresAt,
        verified: false,
        attempts: 0,
      });

      // In production, integrate with SMS gateway (Twilio, AWS SNS, etc.)
      console.log(`OTP for ${cleanedNumber}: ${otp}`);
      
      return {
        success: true,
        message: `OTP sent to ${mobileNumber}. Valid for 5 minutes.`,
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }
  }

  async verifyOTP(mobileNumber: string, otp: string): Promise<{ success: boolean; token?: string; userId?: string; requiresFaceSetup?: boolean }> {
    try {
      const cleanedNumber = mobileNumber.replace(/\D/g, '');

      // Find valid OTP
      const otpRecord = await db.query.otpVerifications.findFirst({
        where: and(
          eq(otpVerifications.mobileNumber, cleanedNumber),
          eq(otpVerifications.otp, otp),
          gt(otpVerifications.expiresAt, new Date()),
          eq(otpVerifications.verified, false)
        ),
      });

      if (!otpRecord) {
        return { success: false };
      }

      // Check attempt limit
      if (otpRecord.attempts >= 3) {
        return { success: false };
      }

      // Update attempts
      await db.update(otpVerifications)
        .set({ attempts: otpRecord.attempts + 1 })
        .where(eq(otpVerifications.id, otpRecord.id));

      // Mark as verified
      await db.update(otpVerifications)
        .set({ verified: true })
        .where(eq(otpVerifications.id, otpRecord.id));

      // Check if user exists
      let user = await db.query.users.findFirst({
        where: eq(users.mobileNumber, cleanedNumber),
      });

      // Create new user if doesn't exist
      if (!user) {
        const [newUser] = await db.insert(users).values({
          mobileNumber: cleanedNumber,
          name: `User ${cleanedNumber.slice(-4)}`,
          verificationLevel: 0,
        }).returning();
        user = newUser;
      }

      // Check if face embedding exists
      const requiresFaceSetup = !user.faceEmbedding;

      // Generate session token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      await db.insert(loginSessions).values({
        userId: user.id,
        token,
        faceVerified: false,
        expiresAt,
      });

      return {
        success: true,
        token,
        userId: user.id,
        requiresFaceSetup,
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false };
    }
  }

  async setupFaceVerification(userId: string, faceImage: Buffer): Promise<{ success: boolean; message: string }> {
    try {
      await faceAI.initialize();
      
      // Extract face embedding
      const embedding = await faceAI.extractFaceEmbedding(faceImage);

      // Store face embedding
      await db.update(users)
        .set({ 
          faceEmbedding: embedding,
          verificationLevel: 1 
        })
        .where(eq(users.id, userId));

      return {
        success: true,
        message: 'Face verification setup complete',
      };
    } catch (error) {
      console.error('Setup face verification error:', error);
      return {
        success: false,
        message: 'Failed to setup face verification',
      };
    }
  }

  async verifyFaceLogin(token: string, faceImage: Buffer): Promise<{ success: boolean; message: string }> {
    try {
      // Find session
      const session = await db.query.loginSessions.findFirst({
        where: and(
          eq(loginSessions.token, token),
          gt(loginSessions.expiresAt, new Date())
        ),
      });

      if (!session) {
        return { success: false, message: 'Invalid or expired session' };
      }

      // Get user's stored face embedding
      const user = await db.query.users.findFirst({
        where: eq(users.id, session.userId),
      });

      if (!user || !user.faceEmbedding) {
        return { success: false, message: 'Face verification not setup' };
      }

      await faceAI.initialize();

      // Extract face from login image
      const loginEmbedding = await faceAI.extractFaceEmbedding(faceImage);

      // Compare faces
      const similarity = await faceAI.compareFaces(
        user.faceEmbedding as any,
        loginEmbedding
      );

      if (similarity >= 0.75) {
        // Update session as face verified
        await db.update(loginSessions)
          .set({ faceVerified: true })
          .where(eq(loginSessions.id, session.id));

        // Update last activity
        await db.update(users)
          .set({ lastActivityAt: new Date() })
          .where(eq(users.id, user.id));

        return {
          success: true,
          message: 'Face verification successful',
        };
      }

      return {
        success: false,
        message: 'Face verification failed. Please try again.',
      };
    } catch (error) {
      console.error('Verify face login error:', error);
      return {
        success: false,
        message: 'Face verification error',
      };
    }
  }

  async validateSession(token: string): Promise<{ valid: boolean; userId?: string; faceVerified?: boolean }> {
    try {
      const session = await db.query.loginSessions.findFirst({
        where: and(
          eq(loginSessions.token, token),
          gt(loginSessions.expiresAt, new Date())
        ),
      });

      if (!session) {
        return { valid: false };
      }

      return {
        valid: true,
        userId: session.userId,
        faceVerified: session.faceVerified,
      };
    } catch (error) {
      return { valid: false };
    }
  }
}
