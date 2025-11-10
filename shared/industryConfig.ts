export interface IndustryKYCConfig {
  industry: 'BANKING' | 'FINTECH' | 'CRYPTOCURRENCY' | 'GOVERNMENT' | 'HEALTHCARE' | 'ECOMMERCE' | 'GAMING' | 'TELECOM' | 'INSURANCE' | 'CUSTOM';
  verificationLevels: {
    basic: boolean;
    enhanced: boolean;
    superior: boolean;
  };
  requiredChecks: {
    documentVerification: boolean;
    faceVerification: boolean;
    livenessDetection: boolean;
    fingerprintVerification: boolean;
    palmVeinVerification: boolean;
    voiceVerification: boolean;
    behavioralAnalytics: boolean;
    syntheticIdentityDetection: boolean;
    blockchainAudit: boolean;
    amlScreening: boolean;
    sanctionsScreening: boolean;
    pepScreening: boolean;
    creditCheck: boolean;
    addressVerification: boolean;
  };
  riskThresholds: {
    autoApprove: number; // e.g., 85 - auto approve if score >= 85
    manualReview: number; // e.g., 60 - manual review if 60 <= score < 85
    autoReject: number; // e.g., 40 - auto reject if score < 40
  };
  complianceRequirements: {
    gdpr: boolean;
    kycAml: boolean;
    ccpa: boolean;
    pci: boolean;
    hipaa: boolean;
    sox: boolean;
  };
  dataRetentionDays: number;
  reVerificationPeriodDays: number;
  fraudAlertSeverity: Array<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>;
}

// Default compliance requirements, based on GOVERNMENT preset
const DEFAULT_COMPLIANCE_REQUIREMENTS: IndustryKYCConfig['complianceRequirements'] = {
  gdpr: true,
  kycAml: true,
  ccpa: true,
  pci: false,
  hipaa: false,
  sox: true,
};

const DEFAULT_REQUIRED_CHECKS: IndustryKYCConfig['requiredChecks'] = {
  documentVerification: true,
  faceVerification: true, // Mandatory for facial verification login
  livenessDetection: true,
  fingerprintVerification: true,
  palmVeinVerification: true,
  voiceVerification: true,
  behavioralAnalytics: true,
  syntheticIdentityDetection: true,
  blockchainAudit: true,
  amlScreening: true,
  sanctionsScreening: true,
  pepScreening: true,
  creditCheck: false,
  addressVerification: true,
};

export const INDUSTRY_PRESETS: Record<string, Partial<IndustryKYCConfig>> = {
  BANKING: {
    industry: 'BANKING',
    verificationLevels: { basic: true, enhanced: true, superior: true },
    requiredChecks: {
      documentVerification: true,
      faceVerification: true,
      livenessDetection: true,
      fingerprintVerification: false,
      palmVeinVerification: false,
      voiceVerification: false,
      behavioralAnalytics: true,
      syntheticIdentityDetection: true,
      blockchainAudit: true,
      amlScreening: true,
      sanctionsScreening: true,
      pepScreening: true,
      creditCheck: true,
      addressVerification: true,
    },
    riskThresholds: { autoApprove: 90, manualReview: 70, autoReject: 50 },
    complianceRequirements: { gdpr: true, kycAml: true, ccpa: true, pci: true, hipaa: false, sox: true },
    dataRetentionDays: 2555,
    reVerificationPeriodDays: 365,
    fraudAlertSeverity: ['HIGH', 'CRITICAL'],
  },
  GOVERNMENT: {
    industry: 'GOVERNMENT',
    verificationLevels: { basic: true, enhanced: true, superior: true },
    requiredChecks: DEFAULT_REQUIRED_CHECKS,
    riskThresholds: { autoApprove: 95, manualReview: 80, autoReject: 60 },
    complianceRequirements: DEFAULT_COMPLIANCE_REQUIREMENTS,
    dataRetentionDays: 3650,
    reVerificationPeriodDays: 180,
    fraudAlertSeverity: ['MEDIUM', 'HIGH', 'CRITICAL'],
  },
  CRYPTOCURRENCY: {
    industry: 'CRYPTOCURRENCY',
    verificationLevels: { basic: true, enhanced: true, superior: true },
    requiredChecks: {
      documentVerification: true,
      faceVerification: true,
      livenessDetection: true,
      fingerprintVerification: false,
      palmVeinVerification: false,
      voiceVerification: false,
      behavioralAnalytics: true,
      syntheticIdentityDetection: true,
      blockchainAudit: true,
      amlScreening: true,
      sanctionsScreening: true,
      pepScreening: true,
      creditCheck: false,
      addressVerification: true,
    },
    riskThresholds: { autoApprove: 85, manualReview: 65, autoReject: 45 },
    complianceRequirements: { gdpr: true, kycAml: true, ccpa: true, pci: false, hipaa: false, sox: false },
    dataRetentionDays: 1825,
    reVerificationPeriodDays: 180,
    fraudAlertSeverity: ['MEDIUM', 'HIGH', 'CRITICAL'],
  },
  FINTECH: {
    industry: 'FINTECH',
    verificationLevels: { basic: true, enhanced: true, superior: false },
    requiredChecks: {
      documentVerification: true,
      faceVerification: true,
      livenessDetection: true,
      fingerprintVerification: false,
      palmVeinVerification: false,
      voiceVerification: false,
      behavioralAnalytics: true,
      syntheticIdentityDetection: true,
      blockchainAudit: true,
      amlScreening: true,
      sanctionsScreening: true,
      pepScreening: false,
      creditCheck: true,
      addressVerification: true,
    },
    riskThresholds: { autoApprove: 85, manualReview: 65, autoReject: 45 },
    complianceRequirements: { gdpr: true, kycAml: true, ccpa: true, pci: true, hipaa: false, sox: false },
    dataRetentionDays: 2555,
    reVerificationPeriodDays: 365,
    fraudAlertSeverity: ['HIGH', 'CRITICAL'],
  },
  ECOMMERCE: {
    industry: 'ECOMMERCE',
    verificationLevels: { basic: true, enhanced: false, superior: false },
    requiredChecks: {
      documentVerification: false,
      faceVerification: false, // Face verification is not required for e-commerce based on this preset
      livenessDetection: false,
      fingerprintVerification: false,
      palmVeinVerification: false,
      voiceVerification: false,
      behavioralAnalytics: true,
      syntheticIdentityDetection: false,
      blockchainAudit: false,
      amlScreening: false,
      sanctionsScreening: false,
      pepScreening: false,
      creditCheck: false,
      addressVerification: true,
    },
    riskThresholds: { autoApprove: 70, manualReview: 50, autoReject: 30 },
    complianceRequirements: { gdpr: true, kycAml: false, ccpa: true, pci: true, hipaa: false, sox: false },
    dataRetentionDays: 730,
    reVerificationPeriodDays: 730,
    fraudAlertSeverity: ['CRITICAL'],
  },
  HEALTHCARE: {
    industry: 'HEALTHCARE',
    verificationLevels: { basic: true, enhanced: true, superior: false },
    requiredChecks: {
      documentVerification: true,
      faceVerification: true,
      livenessDetection: true,
      fingerprintVerification: false,
      palmVeinVerification: false,
      voiceVerification: false,
      behavioralAnalytics: false,
      syntheticIdentityDetection: true,
      blockchainAudit: true,
      amlScreening: false,
      sanctionsScreening: false,
      pepScreening: false,
      creditCheck: false,
      addressVerification: true,
    },
    riskThresholds: { autoApprove: 85, manualReview: 70, autoReject: 50 },
    complianceRequirements: { gdpr: true, kycAml: false, ccpa: true, pci: false, hipaa: true, sox: false },
    dataRetentionDays: 2555,
    reVerificationPeriodDays: 730,
    fraudAlertSeverity: ['HIGH', 'CRITICAL'],
  },
};

// Function to get industry configuration, ensuring government-level compliance for all
export function getIndustryConfig(industry: string): IndustryKYCConfig {
  const preset = INDUSTRY_PRESETS[industry] || INDUSTRY_PRESETS.ECOMMERCE;
  // Apply government-level compliance to all presets
  const governmentPreset = INDUSTRY_PRESETS.GOVERNMENT;
  return {
    ...preset,
    complianceRequirements: governmentPreset.complianceRequirements,
    requiredChecks: {
        ...preset.requiredChecks,
        faceVerification: true, // Ensure face verification is always true for login
        livenessDetection: true, // Ensure liveness detection is always true
    },
    dataRetentionDays: governmentPreset.dataRetentionDays,
    reVerificationPeriodDays: governmentPreset.reVerificationPeriodDays,
    fraudAlertSeverity: governmentPreset.fraudAlertSeverity,
  } as IndustryKYCConfig;
}

// Note: The login logic (mobile OTP, facial verification, no email) is not present in this code.
// This code only defines the KYC configurations and industry presets.
// Actual login implementation would require separate logic in authentication modules.