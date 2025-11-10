
import crypto from 'crypto';

export interface BlockchainRecord {
  recordId: string;
  userId: string;
  verificationId: string;
  timestamp: Date;
  dataHash: string;
  previousHash: string;
  blockHash: string;
  verificationData: {
    documentVerified: boolean;
    faceVerified: boolean;
    riskScore: number;
    outcome: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';
  };
}

export interface FraudAlert {
  alertId: string;
  userId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  alertType: string;
  description: string;
  timestamp: Date;
  triggeringFactors: string[];
  requiresAction: boolean;
}

export class BlockchainAuditTrail {
  private chain: BlockchainRecord[] = [];
  private pendingAlerts: FraudAlert[] = [];

  async recordVerification(
    userId: string,
    verificationId: string,
    verificationData: BlockchainRecord['verificationData']
  ): Promise<BlockchainRecord> {
    const timestamp = new Date();
    const previousHash = this.chain.length > 0 ? this.chain[this.chain.length - 1].blockHash : '0';
    
    const dataToHash = JSON.stringify({
      userId,
      verificationId,
      timestamp: timestamp.toISOString(),
      verificationData,
    });
    
    const dataHash = this.calculateHash(dataToHash);
    const blockHash = this.calculateHash(dataHash + previousHash);

    const record: BlockchainRecord = {
      recordId: this.generateRecordId(),
      userId,
      verificationId,
      timestamp,
      dataHash,
      previousHash,
      blockHash,
      verificationData,
    };

    this.chain.push(record);
    console.log(`Blockchain record created: ${record.recordId}`);

    return record;
  }

  async createFraudAlert(
    userId: string,
    alertType: string,
    description: string,
    severity: FraudAlert['severity'],
    triggeringFactors: string[]
  ): Promise<FraudAlert> {
    const alert: FraudAlert = {
      alertId: this.generateAlertId(),
      userId,
      severity,
      alertType,
      description,
      timestamp: new Date(),
      triggeringFactors,
      requiresAction: severity === 'HIGH' || severity === 'CRITICAL',
    };

    this.pendingAlerts.push(alert);
    console.log(`Fraud alert created: ${alert.alertId} - Severity: ${severity}`);

    // In production, send notifications to compliance team
    if (alert.requiresAction) {
      await this.notifyComplianceTeam(alert);
    }

    return alert;
  }

  async getVerificationHistory(userId: string): Promise<BlockchainRecord[]> {
    return this.chain.filter(record => record.userId === userId);
  }

  async getFraudAlerts(userId?: string, severity?: FraudAlert['severity']): Promise<FraudAlert[]> {
    let alerts = this.pendingAlerts;

    if (userId) {
      alerts = alerts.filter(alert => alert.userId === userId);
    }

    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }

    return alerts;
  }

  async verifyChainIntegrity(): Promise<{ isValid: boolean; corruptedBlocks: string[] }> {
    const corruptedBlocks: string[] = [];

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Verify previous hash linkage
      if (currentBlock.previousHash !== previousBlock.blockHash) {
        corruptedBlocks.push(currentBlock.recordId);
      }

      // Verify block hash
      const recalculatedHash = this.calculateHash(currentBlock.dataHash + currentBlock.previousHash);
      if (currentBlock.blockHash !== recalculatedHash) {
        corruptedBlocks.push(currentBlock.recordId);
      }
    }

    return {
      isValid: corruptedBlocks.length === 0,
      chain: this.chain,
    };
  }

  private calculateHash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private generateRecordId(): string {
    return `BLK-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  private generateAlertId(): string {
    return `ALT-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
  }

  private async notifyComplianceTeam(alert: FraudAlert): Promise<void> {
    // In production, integrate with notification services (email, SMS, Slack, etc.)
    console.log(`⚠️  COMPLIANCE ALERT: ${alert.alertType} - ${alert.description}`);
    console.log(`   User: ${alert.userId}, Severity: ${alert.severity}`);
    console.log(`   Factors: ${alert.triggeringFactors.join(', ')}`);
  }
}
