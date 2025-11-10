
import { db } from '../db';
import { monitoringAlerts, documents, fraudDetectionLogs } from '@shared/schema';
import { eq, and, lt } from 'drizzle-orm';

export class MonitoringService {
  async checkDocumentExpiry() {
    const expiringDocs = await db.query.documents.findMany({
      where: and(
        lt(documents.expiryDate, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      ),
    });

    for (const doc of expiringDocs) {
      const verification = await db.query.verifications.findFirst({
        where: eq(documents.verificationId, doc.verificationId),
      });

      if (verification) {
        await this.createAlert(
          verification.userId,
          'document_expiry',
          'medium',
          'Document Expiring Soon',
          `Your ${doc.documentNumber} will expire on ${doc.expiryDate?.toLocaleDateString()}`,
          { documentId: doc.id, expiryDate: doc.expiryDate }
        );
      }
    }

    return expiringDocs.length;
  }

  async detectFraud(
    userId: string | null,
    verificationId: string | null,
    fraudType: string,
    severity: string,
    detectionMethod: string,
    confidenceScore: number,
    evidenceData: any
  ) {
    const [log] = await db.insert(fraudDetectionLogs).values({
      userId,
      verificationId,
      fraudType,
      severity,
      detectionMethod,
      confidenceScore,
      evidenceData,
      actionTaken: severity === 'high' ? 'auto_reject' : 'manual_review',
    }).returning();

    if (userId) {
      await this.createAlert(
        userId,
        'fraud_detection',
        severity,
        'Potential Fraud Detected',
        `Suspicious activity detected: ${fraudType}`,
        { fraudLogId: log.id, confidenceScore }
      );
    }

    return log;
  }

  async createAlert(
    userId: string,
    alertType: string,
    severity: string,
    title: string,
    message: string,
    metadata?: any
  ) {
    const [alert] = await db.insert(monitoringAlerts).values({
      userId,
      alertType,
      severity,
      title,
      message,
      metadata,
      isRead: false,
      isResolved: false,
    }).returning();

    return alert;
  }

  async getUnreadAlerts(userId: string) {
    return await db.query.monitoringAlerts.findMany({
      where: and(
        eq(monitoringAlerts.userId, userId),
        eq(monitoringAlerts.isRead, false)
      ),
    });
  }

  async markAlertAsRead(alertId: string) {
    await db.update(monitoringAlerts)
      .set({ isRead: true })
      .where(eq(monitoringAlerts.id, alertId));
  }

  async resolveAlert(alertId: string) {
    await db.update(monitoringAlerts)
      .set({ 
        isResolved: true,
        resolvedAt: new Date(),
      })
      .where(eq(monitoringAlerts.id, alertId));
  }
}
