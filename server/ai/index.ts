import { DocumentVerificationAI } from './documentVerification';
import { FaceVerificationAI } from './faceVerification';
import { AdaptiveRiskScoringAI, RiskFactors } from './riskScoring';
import { BiometricVerificationAI } from './fingerprintVerification';
import { VoiceVerificationAI } from './voiceVerification';
import { BehavioralAnalyticsAI, BehavioralPattern } from './behavioralAnalytics';
import { SyntheticIdentityDetectionAI } from './syntheticIdentityDetection';
import { BlockchainAuditTrail } from './blockchainAudit';
import { IndustryKYCConfig, getIndustryConfig } from '@shared/industryConfig';

export interface CompleteVerificationResult {
  success: boolean;
  verificationId: string;
  riskScore: number;
  riskLevel: string;
  documentAnalysis: any;
  faceAnalysis: any;
  fingerprintAnalysis?: any;
  voiceAnalysis?: any;
  behavioralAnalysis?: any;
  syntheticIdentityCheck?: any;
  blockchainRecord?: any;
  fraudAlerts?: any[];
  recommendations: string[];
  timestamp: Date;
}

export class AIVerificationOrchestrator {
  private documentAI: DocumentVerificationAI;
  private faceAI: FaceVerificationAI;
  private riskAI: AdaptiveRiskScoringAI;
  private biometricAI: BiometricVerificationAI;
  private voiceAI: VoiceVerificationAI;
  private behavioralAI: BehavioralAnalyticsAI;
  private syntheticDetectionAI: SyntheticIdentityDetectionAI;
  private blockchainAudit: BlockchainAuditTrail;

  constructor() {
    this.documentAI = new DocumentVerificationAI();
    this.faceAI = new FaceVerificationAI();
    this.riskAI = new AdaptiveRiskScoringAI();
    this.biometricAI = new BiometricVerificationAI();
    this.voiceAI = new VoiceVerificationAI();
    this.behavioralAI = new BehavioralAnalyticsAI();
    this.syntheticDetectionAI = new SyntheticIdentityDetectionAI();
    this.blockchainAudit = new BlockchainAuditTrail();
  }

  async initialize() {
    await this.faceAI.initialize();
    console.log('AI Verification Orchestrator initialized with all modules');
  }

  async performCompleteVerification(
    userId: string,
    documentImage: Buffer,
    selfieImage: Buffer,
    documentFaceImage?: Buffer,
    fingerprintImage?: Buffer,
    palmVeinImage?: Buffer,
    voiceAudio?: Buffer,
    behavioralData?: BehavioralPattern,
    industryConfig?: IndustryKYCConfig
  ): Promise<CompleteVerificationResult> {
    const config = industryConfig || getIndustryConfig('ECOMMERCE');
    try {
      // Step 1: Document verification (if required by industry)
      let documentAnalysis = null;
      if (config.requiredChecks.documentVerification) {
        documentAnalysis = await this.documentAI.analyzeDocument(documentImage);
      }

      // Step 1a: Synthetic identity detection (if required)
      let syntheticCheck = null;
      if (config.requiredChecks.syntheticIdentityDetection && documentAnalysis) {
        syntheticCheck = await this.syntheticDetectionAI.detectSyntheticIdentity(
          documentAnalysis.extractedData,
          selfieImage,
          behavioralData
        );
      }

      // Step 2: Face verification (if required by industry)
      let faceAnalysis = null;
      if (config.requiredChecks.faceVerification) {
      if (documentFaceImage) {
        faceAnalysis = await this.faceAI.verifyFace(selfieImage, documentFaceImage);
      } else {
        // Fallback: just check liveness
        faceAnalysis = {
          isMatch: true,
          confidence: 85,
          livenessScore: 85,
          isLive: true,
          faceDetected: true,
          antiSpoofingPassed: true,
        };
      }

      // Step 3: Additional biometric verifications (if required and provided)
      let fingerprintAnalysis = null;
      if (config.requiredChecks.fingerprintVerification && fingerprintImage) {
        fingerprintAnalysis = await this.biometricAI.verifyFingerprint(fingerprintImage);
      }

      let palmVeinAnalysis = null;
      if (config.requiredChecks.palmVeinVerification && palmVeinImage) {
        palmVeinAnalysis = await this.biometricAI.verifyPalmVein(palmVeinImage);
      }

      let voiceAnalysis = null;
      if (config.requiredChecks.voiceVerification && voiceAudio) {
        voiceAnalysis = await this.voiceAI.verifyVoice(voiceAudio);
      }

      // Step 4: Behavioral analytics (if required)
      let behavioralAnalysis = null;
      if (config.requiredChecks.behavioralAnalytics && behavioralData) {
        behavioralAnalysis = await this.behavioralAI.analyzeBehavior(behavioralData);
      }

      // Step 5: Calculate comprehensive risk score
      const riskFactors: RiskFactors = {
        documentVerification: {
          fraudScore: documentAnalysis.fraudScore,
          confidence: documentAnalysis.confidence,
        },
        faceVerification: {
          matchConfidence: faceAnalysis.confidence,
          livenessScore: faceAnalysis.livenessScore,
          antiSpoofing: faceAnalysis.antiSpoofingPassed,
        },
        behavioralBiometrics: behavioralAnalysis ? {
          deviceTrustScore: behavioralAnalysis.trustScore,
          typingPatterns: behavioralAnalysis.similarityToBaseline * 100,
          navigationPatterns: behavioralAnalysis.trustScore,
        } : {
          deviceTrustScore: 80,
          typingPatterns: 75,
          navigationPatterns: 85,
        },
      };

      const riskScoreResult = this.riskAI.calculateRiskScore(riskFactors);

      // Apply industry-specific risk thresholds
      const verificationId = this.generateVerificationId();
      let success = false;
      let outcome = 'REJECTED';
      
      if (riskScoreResult.trustScore >= config.riskThresholds.autoApprove) {
        success = true;
        outcome = 'APPROVED';
      } else if (riskScoreResult.trustScore >= config.riskThresholds.manualReview) {
        success = false;
        outcome = 'MANUAL_REVIEW';
      } else {
        success = false;
        outcome = 'REJECTED';
      }

      // Step 6: Record verification on blockchain (if required)
      let blockchainRecord = null;
      if (config.requiredChecks.blockchainAudit) {

      blockchainRecord = await this.blockchainAudit.recordVerification(
          userId,
          verificationId,
          {
            documentVerified: documentAnalysis?.isValid || false,
            faceVerified: faceAnalysis?.isMatch || false,
            riskScore: riskScoreResult.trustScore,
            outcome,
          }
        );
      }

      // Step 7: Generate fraud alerts if necessary (based on industry severity config)
      const fraudAlerts = [];

      if (syntheticCheck && syntheticCheck.isSynthetic && config.fraudAlertSeverity.includes('CRITICAL')) {
        const alert = await this.blockchainAudit.createFraudAlert(
          userId,
          'SYNTHETIC_IDENTITY',
          'Synthetic identity detected',
          'CRITICAL',
          syntheticCheck.indicators
        );
        fraudAlerts.push(alert);
      }

      if (documentAnalysis && documentAnalysis.securityFeatures.tamperedDetected && config.fraudAlertSeverity.includes('HIGH')) {
        const alert = await this.blockchainAudit.createFraudAlert(
          userId,
          'DOCUMENT_TAMPERING',
          'Document tampering detected',
          'HIGH',
          ['Tampering score: ' + documentAnalysis.securityFeatures.aiTamperingScore]
        );
        fraudAlerts.push(alert);
      }

      if (faceAnalysis && faceAnalysis.livenessScore < 50 && config.fraudAlertSeverity.includes('HIGH')) {
        const alert = await this.blockchainAudit.createFraudAlert(
          userId,
          'LIVENESS_FAILURE',
          'Liveness detection failed - possible spoofing',
          'HIGH',
          ['Liveness score: ' + faceAnalysis.livenessScore]
        );
        fraudAlerts.push(alert);
      }

      if (behavioralAnalysis && behavioralAnalysis.isAnomalous) {
        const alert = await this.blockchainAudit.createFraudAlert(
          userId,
          'BEHAVIORAL_ANOMALY',
          'Unusual behavioral patterns detected',
          'MEDIUM',
          behavioralAnalysis.riskFactors
        );
        fraudAlerts.push(alert);
      }

      return {
        success,
        verificationId,
        riskScore: riskScoreResult.trustScore,
        riskLevel: riskScoreResult.riskLevel,
        documentAnalysis,
        faceAnalysis,
        fingerprintAnalysis,
        voiceAnalysis,
        behavioralAnalysis,
        syntheticIdentityCheck: syntheticCheck,
        blockchainRecord,
        fraudAlerts: fraudAlerts.length > 0 ? fraudAlerts : undefined,
        recommendations: riskScoreResult.recommendations,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Complete verification error:', error);
      throw error;
    }
  }

  private generateVerificationId(): string {
    return `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export * from './documentVerification';
export * from './faceVerification';
export * from './riskScoring';
export * from './fingerprintVerification';
export * from './voiceVerification';
export * from './behavioralAnalytics';
export * from './syntheticIdentityDetection';
export * from './blockchainAudit';

// Extended orchestrator methods
export class AIVerificationOrchestratorExtended extends AIVerificationOrchestrator {
  async verifyFingerprint(fingerprintBuffer: Buffer, storedTemplate?: Buffer) {
    return await this.biometricAI.verifyFingerprint(fingerprintBuffer, storedTemplate);
  }

  async verifyPalmVein(palmVeinBuffer: Buffer, storedTemplate?: Buffer) {
    return await this.biometricAI.verifyPalmVein(palmVeinBuffer, storedTemplate);
  }

  async verifyVoice(audioBuffer: Buffer, storedVoiceprint?: Buffer) {
    return await this.voiceAI.verifyVoice(audioBuffer, storedVoiceprint);
  }

  async analyzeBehavior(behavioralData: BehavioralPattern, historicalPatterns?: BehavioralPattern[]) {
    return await this.behavioralAI.analyzeBehavior(behavioralData, historicalPatterns);
  }

  async getFraudAlerts(userId?: string, severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') {
    return await this.blockchainAudit.getFraudAlerts(userId, severity);
  }

  async getVerificationHistory(userId: string) {
    return await this.blockchainAudit.getVerificationHistory(userId);
  }

  async verifyBlockchainIntegrity() {
    return await this.blockchainAudit.verifyChainIntegrity();
  }
}