
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface SyntheticIdentityResult {
  isSynthetic: boolean;
  confidence: number;
  indicators: string[];
  riskScore: number;
  detectionMethods: {
    aiGenerated: boolean;
    deepfakeDetected: boolean;
    inconsistentData: boolean;
    suspiciousPatterns: boolean;
  };
}

export class SyntheticIdentityDetectionAI {
  async detectSyntheticIdentity(
    documentData: any,
    faceImageBuffer: Buffer,
    behavioralData?: any
  ): Promise<SyntheticIdentityResult> {
    const indicators: string[] = [];
    let riskScore = 0;

    // Check for AI-generated face
    const deepfakeResult = await this.detectDeepfake(faceImageBuffer);
    const aiGenerated = deepfakeResult.isAIGenerated;
    if (aiGenerated) {
      indicators.push('AI-generated face detected');
      riskScore += 40;
    }

    // Check for inconsistent document data
    const dataInconsistency = this.checkDataConsistency(documentData);
    if (dataInconsistency.isInconsistent) {
      indicators.push(...dataInconsistency.issues);
      riskScore += 25;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = this.detectSuspiciousPatterns(documentData, behavioralData);
    if (suspiciousPatterns.detected) {
      indicators.push(...suspiciousPatterns.patterns);
      riskScore += 20;
    }

    const isSynthetic = riskScore > 50;
    const confidence = Math.min(0.95, riskScore / 100);

    return {
      isSynthetic,
      confidence,
      indicators,
      riskScore: Math.min(100, riskScore),
      detectionMethods: {
        aiGenerated,
        deepfakeDetected: deepfakeResult.isDeepfake,
        inconsistentData: dataInconsistency.isInconsistent,
        suspiciousPatterns: suspiciousPatterns.detected,
      },
    };
  }

  private async detectDeepfake(imageBuffer: Buffer): Promise<{ isAIGenerated: boolean; isDeepfake: boolean; confidence: number }> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return { isAIGenerated: false, isDeepfake: false, confidence: 0 };
      }

      const base64Image = imageBuffer.toString('base64');
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at detecting AI-generated images and deepfakes. Analyze the image for signs of synthetic generation, including unnatural features, artifacts, inconsistent lighting, or GAN fingerprints.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this face image for signs of AI generation or deepfake manipulation. Return JSON with {isAIGenerated: boolean, isDeepfake: boolean, confidence: number, indicators: string[]}',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 500,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"isAIGenerated": false, "isDeepfake": false, "confidence": 0}');
      return {
        isAIGenerated: result.isAIGenerated || false,
        isDeepfake: result.isDeepfake || false,
        confidence: result.confidence || 0,
      };
    } catch (error) {
      console.error('Deepfake detection error:', error);
      return { isAIGenerated: false, isDeepfake: false, confidence: 0 };
    }
  }

  private checkDataConsistency(documentData: any): { isInconsistent: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check for common synthetic identity patterns
    if (documentData.name && documentData.name.length < 3) {
      issues.push('Unusually short name');
    }

    if (documentData.dateOfBirth) {
      const dob = new Date(documentData.dateOfBirth);
      const age = (new Date().getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365);
      
      if (age < 18 || age > 120) {
        issues.push('Suspicious age detected');
      }
    }

    // Check for sequential or patterned document numbers
    if (documentData.documentNumber) {
      const hasSequential = /(\d)\1{3,}/.test(documentData.documentNumber);
      if (hasSequential) {
        issues.push('Sequential pattern in document number');
      }
    }

    // Check for missing critical fields
    const requiredFields = ['name', 'dateOfBirth', 'documentNumber'];
    const missingFields = requiredFields.filter(field => !documentData[field]);
    if (missingFields.length > 1) {
      issues.push('Multiple required fields missing');
    }

    return {
      isInconsistent: issues.length > 0,
      issues,
    };
  }

  private detectSuspiciousPatterns(documentData: any, behavioralData?: any): { detected: boolean; patterns: string[] } {
    const patterns: string[] = [];

    // Check for recently created identity
    if (documentData.issueDate) {
      const issueDate = new Date(documentData.issueDate);
      const daysSinceIssue = (new Date().getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceIssue < 30) {
        patterns.push('Very recently issued document');
      }
    }

    // Check behavioral anomalies
    if (behavioralData) {
      if (behavioralData.sessionDuration && behavioralData.sessionDuration < 60) {
        patterns.push('Unusually fast verification attempt');
      }

      if (behavioralData.deviceFingerprint && behavioralData.deviceFingerprint.includes('headless')) {
        patterns.push('Headless browser detected');
      }
    }

    // Check for common fraud indicators
    if (documentData.address && documentData.address.toLowerCase().includes('po box')) {
      patterns.push('PO Box address detected');
    }

    return {
      detected: patterns.length > 0,
      patterns,
    };
  }
}
