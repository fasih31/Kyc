
export interface BehavioralPattern {
  userId: string;
  sessionId: string;
  deviceFingerprint: string;
  typingPattern: {
    averageSpeed: number;
    keyPressIntervals: number[];
    errorRate: number;
  };
  mouseMovement: {
    averageSpeed: number;
    curvature: number;
    acceleration: number;
  };
  navigationPattern: {
    clickSequence: string[];
    pageVisitDuration: number[];
    scrollBehavior: number[];
  };
  timeBasedMetrics: {
    activeHours: number[];
    sessionDuration: number;
    interactionFrequency: number;
  };
}

export interface BehavioralAnalysisResult {
  isAnomalous: boolean;
  trustScore: number;
  riskFactors: string[];
  confidence: number;
  similarityToBaseline: number;
}

export class BehavioralAnalyticsAI {
  private userBaselines: Map<string, BehavioralPattern[]> = new Map();

  async analyzeBehavior(
    currentPattern: BehavioralPattern,
    historicalPatterns?: BehavioralPattern[]
  ): Promise<BehavioralAnalysisResult> {
    const riskFactors: string[] = [];
    let trustScore = 100;

    // Store or retrieve baseline
    if (historicalPatterns && historicalPatterns.length > 0) {
      this.userBaselines.set(currentPattern.userId, historicalPatterns);
    }

    const baseline = this.userBaselines.get(currentPattern.userId) || [];

    // Analyze typing patterns
    const typingAnomaly = this.analyzeTypingPattern(currentPattern.typingPattern, baseline);
    if (typingAnomaly.isAnomalous) {
      riskFactors.push('Unusual typing pattern detected');
      trustScore -= typingAnomaly.severity * 15;
    }

    // Analyze mouse movement
    const mouseAnomaly = this.analyzeMouseMovement(currentPattern.mouseMovement, baseline);
    if (mouseAnomaly.isAnomalous) {
      riskFactors.push('Unusual mouse movement detected');
      trustScore -= mouseAnomaly.severity * 12;
    }

    // Analyze navigation patterns
    const navigationAnomaly = this.analyzeNavigationPattern(currentPattern.navigationPattern, baseline);
    if (navigationAnomaly.isAnomalous) {
      riskFactors.push('Unusual navigation behavior');
      trustScore -= navigationAnomaly.severity * 10;
    }

    // Analyze time-based metrics
    const timeAnomaly = this.analyzeTimeBasedMetrics(currentPattern.timeBasedMetrics, baseline);
    if (timeAnomaly.isAnomalous) {
      riskFactors.push('Unusual session timing');
      trustScore -= timeAnomaly.severity * 8;
    }

    // Device fingerprint check
    const deviceAnomaly = this.checkDeviceFingerprint(currentPattern.deviceFingerprint, baseline);
    if (deviceAnomaly.isAnomalous) {
      riskFactors.push('New or suspicious device detected');
      trustScore -= 20;
    }

    const similarityToBaseline = this.calculateOverallSimilarity(currentPattern, baseline);
    const isAnomalous = trustScore < 60 || riskFactors.length > 2;

    return {
      isAnomalous,
      trustScore: Math.max(0, Math.min(100, trustScore)),
      riskFactors,
      confidence: baseline.length > 5 ? 0.9 : 0.6,
      similarityToBaseline,
    };
  }

  private analyzeTypingPattern(
    current: BehavioralPattern['typingPattern'],
    baseline: BehavioralPattern[]
  ): { isAnomalous: boolean; severity: number } {
    if (baseline.length === 0) return { isAnomalous: false, severity: 0 };

    const avgBaselineSpeed = baseline.reduce((sum, p) => sum + p.typingPattern.averageSpeed, 0) / baseline.length;
    const speedDeviation = Math.abs(current.averageSpeed - avgBaselineSpeed) / avgBaselineSpeed;

    const avgBaselineError = baseline.reduce((sum, p) => sum + p.typingPattern.errorRate, 0) / baseline.length;
    const errorDeviation = Math.abs(current.errorRate - avgBaselineError);

    const isAnomalous = speedDeviation > 0.5 || errorDeviation > 0.3;
    const severity = Math.min(1, (speedDeviation + errorDeviation) / 2);

    return { isAnomalous, severity };
  }

  private analyzeMouseMovement(
    current: BehavioralPattern['mouseMovement'],
    baseline: BehavioralPattern[]
  ): { isAnomalous: boolean; severity: number } {
    if (baseline.length === 0) return { isAnomalous: false, severity: 0 };

    const avgBaselineSpeed = baseline.reduce((sum, p) => sum + p.mouseMovement.averageSpeed, 0) / baseline.length;
    const speedDeviation = Math.abs(current.averageSpeed - avgBaselineSpeed) / avgBaselineSpeed;

    const avgBaselineCurvature = baseline.reduce((sum, p) => sum + p.mouseMovement.curvature, 0) / baseline.length;
    const curvatureDeviation = Math.abs(current.curvature - avgBaselineCurvature) / avgBaselineCurvature;

    const isAnomalous = speedDeviation > 0.6 || curvatureDeviation > 0.5;
    const severity = Math.min(1, (speedDeviation + curvatureDeviation) / 2);

    return { isAnomalous, severity };
  }

  private analyzeNavigationPattern(
    current: BehavioralPattern['navigationPattern'],
    baseline: BehavioralPattern[]
  ): { isAnomalous: boolean; severity: number } {
    if (baseline.length === 0) return { isAnomalous: false, severity: 0 };

    // Check for unusual page sequences
    const commonSequences = this.extractCommonSequences(baseline);
    const matchesCommonPattern = this.sequenceMatchesBaseline(current.clickSequence, commonSequences);

    const avgBaselineDuration = baseline.reduce((sum, p) => 
      sum + p.navigationPattern.pageVisitDuration.reduce((a, b) => a + b, 0) / p.navigationPattern.pageVisitDuration.length, 0
    ) / baseline.length;

    const currentAvgDuration = current.pageVisitDuration.reduce((a, b) => a + b, 0) / current.pageVisitDuration.length;
    const durationDeviation = Math.abs(currentAvgDuration - avgBaselineDuration) / avgBaselineDuration;

    const isAnomalous = !matchesCommonPattern || durationDeviation > 0.7;
    const severity = Math.min(1, durationDeviation);

    return { isAnomalous, severity };
  }

  private analyzeTimeBasedMetrics(
    current: BehavioralPattern['timeBasedMetrics'],
    baseline: BehavioralPattern[]
  ): { isAnomalous: boolean; severity: number } {
    if (baseline.length === 0) return { isAnomalous: false, severity: 0 };

    // Check if accessing at unusual hours
    const commonHours = this.getCommonActiveHours(baseline);
    const currentHour = new Date().getHours();
    const unusualTime = !commonHours.includes(currentHour);

    const avgBaselineDuration = baseline.reduce((sum, p) => sum + p.timeBasedMetrics.sessionDuration, 0) / baseline.length;
    const durationDeviation = Math.abs(current.sessionDuration - avgBaselineDuration) / avgBaselineDuration;

    const isAnomalous = unusualTime || durationDeviation > 1.0;
    const severity = Math.min(1, durationDeviation);

    return { isAnomalous, severity };
  }

  private checkDeviceFingerprint(
    currentDevice: string,
    baseline: BehavioralPattern[]
  ): { isAnomalous: boolean } {
    if (baseline.length === 0) return { isAnomalous: false };

    const knownDevices = new Set(baseline.map(p => p.deviceFingerprint));
    const isAnomalous = !knownDevices.has(currentDevice);

    return { isAnomalous };
  }

  private extractCommonSequences(baseline: BehavioralPattern[]): string[][] {
    return baseline.map(p => p.navigationPattern.clickSequence);
  }

  private sequenceMatchesBaseline(currentSequence: string[], commonSequences: string[][]): boolean {
    // Simple pattern matching - check if current sequence overlaps with known patterns
    for (const baselineSeq of commonSequences) {
      let matchCount = 0;
      for (const click of currentSequence) {
        if (baselineSeq.includes(click)) matchCount++;
      }
      if (matchCount / currentSequence.length > 0.5) return true;
    }
    return false;
  }

  private getCommonActiveHours(baseline: BehavioralPattern[]): number[] {
    const hourCounts = new Map<number, number>();
    
    baseline.forEach(pattern => {
      pattern.timeBasedMetrics.activeHours.forEach(hour => {
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });
    });

    // Return hours that appear in at least 30% of sessions
    const threshold = baseline.length * 0.3;
    return Array.from(hourCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([hour, _]) => hour);
  }

  private calculateOverallSimilarity(current: BehavioralPattern, baseline: BehavioralPattern[]): number {
    if (baseline.length === 0) return 0.5;

    let totalSimilarity = 0;
    const weights = {
      typing: 0.25,
      mouse: 0.25,
      navigation: 0.30,
      timing: 0.20,
    };

    // Calculate weighted similarity across all dimensions
    baseline.forEach(baselinePattern => {
      const typingSim = 1 - Math.min(1, Math.abs(current.typingPattern.averageSpeed - baselinePattern.typingPattern.averageSpeed) / 100);
      const mouseSim = 1 - Math.min(1, Math.abs(current.mouseMovement.averageSpeed - baselinePattern.mouseMovement.averageSpeed) / 10);
      const navSim = this.calculateNavigationSimilarity(current.navigationPattern, baselinePattern.navigationPattern);
      const timeSim = 1 - Math.min(1, Math.abs(current.timeBasedMetrics.sessionDuration - baselinePattern.timeBasedMetrics.sessionDuration) / 3600);

      totalSimilarity += typingSim * weights.typing + mouseSim * weights.mouse + navSim * weights.navigation + timeSim * weights.timing;
    });

    return totalSimilarity / baseline.length;
  }

  private calculateNavigationSimilarity(nav1: BehavioralPattern['navigationPattern'], nav2: BehavioralPattern['navigationPattern']): number {
    const sequenceOverlap = nav1.clickSequence.filter(click => nav2.clickSequence.includes(click)).length;
    return sequenceOverlap / Math.max(nav1.clickSequence.length, nav2.clickSequence.length);
  }
}
