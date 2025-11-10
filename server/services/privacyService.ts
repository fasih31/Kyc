
import { db } from '../db';
import { privacyConsents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export class PrivacyService {
  async grantConsent(
    userId: string,
    consentType: string,
    purpose: string,
    dataScope: string[],
    grantedTo: string,
    expiresAt?: Date
  ) {
    const [consent] = await db.insert(privacyConsents).values({
      userId,
      consentType,
      purpose,
      dataScope,
      grantedTo,
      isGranted: true,
      grantedAt: new Date(),
      expiresAt,
    }).returning();

    return consent;
  }

  async revokeConsent(userId: string, consentId: string) {
    await db.update(privacyConsents)
      .set({ 
        isGranted: false,
        revokedAt: new Date(),
      })
      .where(and(
        eq(privacyConsents.id, consentId),
        eq(privacyConsents.userId, userId)
      ));
  }

  async getActiveConsents(userId: string) {
    return await db.query.privacyConsents.findMany({
      where: and(
        eq(privacyConsents.userId, userId),
        eq(privacyConsents.isGranted, true)
      ),
    });
  }

  async checkConsent(userId: string, purpose: string): Promise<boolean> {
    const consent = await db.query.privacyConsents.findFirst({
      where: and(
        eq(privacyConsents.userId, userId),
        eq(privacyConsents.purpose, purpose),
        eq(privacyConsents.isGranted, true)
      ),
    });

    if (!consent) return false;
    if (consent.expiresAt && consent.expiresAt < new Date()) return false;
    
    return true;
  }
}
