
export interface RiskFactors {
  documentVerification: {
    fraudScore: number;
    confidence: number;
  };
  faceVerification: {
    matchConfidence: number;
    livenessScore: number;
    antiSpoofing: boolean;
  };
  behavioralBiometrics?: {
    deviceTrustScore: number;
    typingPatterns: number;
    navigationPatterns: number;
  };
  historicalData?: {
    previousVerifications: number;
    fraudAttempts: number;
    successfulVerifications: number;
  };
}

export interface RiskScoreResult {
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: {
    documentScore: number;
    biometricScore: number;
    behavioralScore: number;
    historicalScore: number;
  };
  recommendations: string[];
  trustScore: number;
}

export class AdaptiveRiskScoringAI {
  calculateRiskScore(factors: RiskFactors): RiskScoreResult {
    // Calculate individual component scores
    const documentScore = this.calculateDocumentScore(factors.documentVerification);
    const biometricScore = this.calculateBiometricScore(factors.faceVerification);
    const behavioralScore = this.calculateBehavioralScore(factors.behavioralBiometrics);
    const historicalScore = this.calculateHistoricalScore(factors.historicalData);

    // Weighted average with adaptive weighting
    const weights = this.calculateAdaptiveWeights(factors);
    const overallScore = 
      documentScore * weights.document +
      biometricScore * weights.biometric +
      behavioralScore * weights.behavioral +
      historicalScore * weights.historical;

    const riskLevel = this.determineRiskLevel(overallScore);
    const recommendations = this.generateRecommendations(factors, overallScore, riskLevel);
    const trustScore = Math.round(overallScore);

    return {
      overallScore: Math.round(overallScore),
      riskLevel,
      breakdown: {
        documentScore: Math.round(documentScore),
        biometricScore: Math.round(biometricScore),
        behavioralScore: Math.round(behavioralScore),
        historicalScore: Math.round(historicalScore),
      },
      recommendations,
      trustScore,
    };
  }

  private calculateDocumentScore(doc: RiskFactors['documentVerification']): number {
    // Higher confidence and lower fraud score = higher trust
    const fraudPenalty = doc.fraudScore;
    const confidenceBonus = doc.confidence;
    return Math.max(0, 100 - fraudPenalty + (confidenceBonus - 50) / 2);
  }

  private calculateBiometricScore(bio: RiskFactors['faceVerification']): number {
    let score = bio.matchConfidence;
    
    // Bonus for high liveness
    if (bio.livenessScore > 80) score += 10;
    if (bio.livenessScore > 90) score += 5;
    
    // Bonus for anti-spoofing
    if (bio.antiSpoofing) score += 10;
    
    // Penalty for low liveness
    if (bio.livenessScore < 50) score -= 30;
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateBehavioralScore(behavioral?: RiskFactors['behavioralBiometrics']): number {
    if (!behavioral) return 75; // Neutral score if no data
    
    return (
      behavioral.deviceTrustScore * 0.4 +
      behavioral.typingPatterns * 0.3 +
      behavioral.navigationPatterns * 0.3
    );
  }

  private calculateHistoricalScore(historical?: RiskFactors['historicalData']): number {
    if (!historical) return 50; // Neutral score for new users
    
    const totalAttempts = historical.previousVerifications + historical.fraudAttempts;
    if (totalAttempts === 0) return 50;
    
    const successRate = historical.successfulVerifications / totalAttempts;
    const fraudRate = historical.fraudAttempts / totalAttempts;
    
    let score = 50 + (successRate * 50) - (fraudRate * 70);
    
    return Math.max(0, Math.min(100, score));
  }

  private calculateAdaptiveWeights(factors: RiskFactors) {
    // Adaptive weighting based on data availability and quality
    let weights = {
      document: 0.40,
      biometric: 0.40,
      behavioral: 0.10,
      historical: 0.10,
    };

    // Adjust weights based on confidence levels
    if (factors.documentVerification.confidence > 90) {
      weights.document += 0.05;
      weights.biometric -= 0.05;
    }

    if (factors.faceVerification.livenessScore > 90) {
      weights.biometric += 0.05;
      weights.behavioral -= 0.05;
    }

    if (factors.historicalData && factors.historicalData.previousVerifications > 5) {
      weights.historical += 0.05;
      weights.document -= 0.05;
    }

    return weights;
  }

  private determineRiskLevel(score: number): RiskScoreResult['riskLevel'] {
    if (score >= 85) return 'LOW';
    if (score >= 65) return 'MEDIUM';
    if (score >= 40) return 'HIGH';
    return 'CRITICAL';
  }

  private generateRecommendations(
    factors: RiskFactors,
    score: number,
    riskLevel: RiskScoreResult['riskLevel']
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      recommendations.push('Manual review recommended');
      recommendations.push('Additional verification steps required');
    }

    if (factors.documentVerification.fraudScore > 50) {
      recommendations.push('Document authenticity concerns detected');
    }

    if (factors.faceVerification.livenessScore < 60) {
      recommendations.push('Liveness verification failed - possible spoofing attempt');
    }

    if (!factors.faceVerification.antiSpoofing) {
      recommendations.push('Anti-spoofing check failed');
    }

    if (score > 85) {
      recommendations.push('Verification successful - high confidence');
    }

    return recommendations;
  }
}
