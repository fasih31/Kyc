
import { db } from '../db';
import { apiAccessLogs, users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class APIIntegrationService {
  async logAPIAccess(
    clientId: string,
    userId: string | null,
    endpoint: string,
    method: string,
    requestData: any,
    responseStatus: number,
    trustScoreShared: number | null,
    ipAddress: string,
    userAgent: string
  ) {
    await db.insert(apiAccessLogs).values({
      clientId,
      userId,
      endpoint,
      method,
      requestData,
      responseStatus,
      trustScoreShared,
      ipAddress,
      userAgent,
    });
  }

  async shareVerificationStatus(userId: string, clientId: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      userId: user.id,
      verificationLevel: user.verificationLevel,
      trustScore: user.trustScore,
      isActive: user.isActive,
      sharedAt: new Date(),
    };
  }

  async webhookNotification(url: string, event: string, data: any) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Ali-V-Event': event,
        },
        body: JSON.stringify(data),
      });

      return {
        success: response.ok,
        status: response.status,
      };
    } catch (error) {
      console.error('Webhook error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
