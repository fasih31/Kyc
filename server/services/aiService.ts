import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface DocumentOCRResult {
  success: boolean;
  extractedData?: {
    documentNumber?: string;
    fullName?: string;
    dateOfBirth?: string;
    expiryDate?: string;
    nationality?: string;
    issueDate?: string;
    documentType?: string;
  };
  confidence?: number;
  error?: string;
}

interface FaceMatchResult {
  success: boolean;
  matchScore?: number;
  isLivenessDetected?: boolean;
  confidence?: number;
  error?: string;
}

interface FraudAnalysisResult {
  isFraudulent: boolean;
  riskScore: number;
  flaggedReasons: string[];
  confidence: number;
}

export class AIService {
  async analyzeDocument(imageBase64: string): Promise<DocumentOCRResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this identity document and extract all visible information. 
                Return a JSON object with these fields: documentNumber, fullName, dateOfBirth, expiryDate, nationality, issueDate, documentType.
                If you cannot read a field clearly, omit it from the response.
                Also assess if this appears to be a genuine government-issued document.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: "No response from AI" };
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { success: false, error: "Could not parse AI response" };
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        extractedData,
        confidence: 0.85
      };
    } catch (error) {
      console.error('Document OCR error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async compareFaces(documentImageBase64: string, selfieBase64: string): Promise<FaceMatchResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Compare these two face images and determine:
                1. Do they appear to be the same person? (yes/no)
                2. Match confidence score (0-100)
                3. Does the second image show signs of being a live person vs a photo/screen? (liveness detection)
                
                Respond with JSON format: { "isSamePerson": boolean, "matchScore": number, "isLive": boolean }`
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${documentImageBase64}` }
              },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${selfieBase64}` }
              }
            ]
          }
        ],
        max_tokens: 300,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: "No response from AI" };
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { success: false, error: "Could not parse AI response" };
      }

      const result = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        matchScore: result.matchScore,
        isLivenessDetected: result.isLive,
        confidence: 0.9
      };
    } catch (error) {
      console.error('Face comparison error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async detectFraud(documentData: any, biometricData: any): Promise<FraudAnalysisResult> {
    const flaggedReasons: string[] = [];
    let riskScore = 100;

    if (!documentData || Object.keys(documentData).length < 3) {
      flaggedReasons.push("Insufficient document data extracted");
      riskScore -= 30;
    }

    if (biometricData?.matchScore && biometricData.matchScore < 70) {
      flaggedReasons.push("Low face match score");
      riskScore -= 25;
    }

    if (biometricData?.isLivenessDetected === false) {
      flaggedReasons.push("Liveness detection failed");
      riskScore -= 20;
    }

    if (documentData?.expiryDate) {
      const expiryDate = new Date(documentData.expiryDate);
      if (expiryDate < new Date()) {
        flaggedReasons.push("Document has expired");
        riskScore -= 40;
      }
    }

    const isFraudulent = riskScore < 50;

    return {
      isFraudulent,
      riskScore: Math.max(0, Math.min(100, riskScore)),
      flaggedReasons,
      confidence: 0.85
    };
  }

  async calculateRiskScore(
    documentAnalysis: DocumentOCRResult,
    faceMatch: FaceMatchResult
  ): Promise<number> {
    let score = 100;

    if (!documentAnalysis.success) {
      score -= 40;
    } else if (documentAnalysis.confidence) {
      score = score * documentAnalysis.confidence;
    }

    if (!faceMatch.success) {
      score -= 30;
    } else if (faceMatch.matchScore) {
      const matchPenalty = (100 - faceMatch.matchScore) * 0.3;
      score -= matchPenalty;
    }

    if (faceMatch.isLivenessDetected === false) {
      score -= 20;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

export const aiService = new AIService();
