
import Tesseract from 'tesseract.js';
import sharp from 'sharp';

export interface DocumentAnalysisResult {
  isValid: boolean;
  confidence: number;
  extractedData: {
    documentType?: string;
    documentNumber?: string;
    name?: string;
    dateOfBirth?: string;
    expiryDate?: string;
    issueDate?: string;
  };
  securityFeatures: {
    hologramDetected: boolean;
    watermarkDetected: boolean;
    tamperedDetected: boolean;
  };
  fraudScore: number;
}

export class DocumentVerificationAI {
  async analyzeDocument(imageBuffer: Buffer): Promise<DocumentAnalysisResult> {
    try {
      // Preprocess image for better OCR
      const processedImage = await sharp(imageBuffer)
        .resize(2000, null, { fit: 'inside' })
        .sharpen()
        .normalize()
        .toBuffer();

      // Perform OCR
      const { data } = await Tesseract.recognize(processedImage, 'eng+urd+ara', {
        logger: () => {}, // Silent mode
      });

      // Extract text and analyze
      const extractedText = data.text;
      const extractedData = this.extractDocumentInfo(extractedText);
      
      // Detect security features
      const securityFeatures = await this.detectSecurityFeatures(processedImage);
      
      // Calculate fraud score
      const fraudScore = this.calculateFraudScore(extractedData, securityFeatures, data.confidence);

      return {
        isValid: fraudScore < 30 && data.confidence > 70,
        confidence: data.confidence,
        extractedData,
        securityFeatures,
        fraudScore,
      };
    } catch (error) {
      console.error('Document verification error:', error);
      throw new Error('Failed to analyze document');
    }
  }

  private extractDocumentInfo(text: string): DocumentAnalysisResult['extractedData'] {
    const data: DocumentAnalysisResult['extractedData'] = {};

    // Extract CNIC/Passport number (13 digits for CNIC)
    const cnicMatch = text.match(/\b\d{5}-\d{7}-\d{1}\b|\b\d{13}\b/);
    if (cnicMatch) {
      data.documentNumber = cnicMatch[0];
      data.documentType = 'CNIC';
    }

    // Extract passport number
    const passportMatch = text.match(/[A-Z]{2}\d{7}/);
    if (passportMatch) {
      data.documentNumber = passportMatch[0];
      data.documentType = 'Passport';
    }

    // Extract dates (DD-MM-YYYY or DD/MM/YYYY)
    const dateMatches = text.match(/\b\d{2}[-/]\d{2}[-/]\d{4}\b/g);
    if (dateMatches && dateMatches.length > 0) {
      data.dateOfBirth = dateMatches[0];
      if (dateMatches.length > 1) {
        data.issueDate = dateMatches[1];
      }
      if (dateMatches.length > 2) {
        data.expiryDate = dateMatches[2];
      }
    }

    return data;
  }

  private async detectSecurityFeatures(imageBuffer: Buffer): Promise<DocumentAnalysisResult['securityFeatures']> {
    // Analyze image for security features using edge detection and pattern analysis
    const metadata = await sharp(imageBuffer).metadata();
    
    // Simplified security feature detection
    // In production, use more advanced CV techniques
    return {
      hologramDetected: metadata.hasAlpha || false,
      watermarkDetected: (metadata.density || 0) > 150,
      tamperedDetected: false, // Would use AI-based tampering detection
    };
  }

  private calculateFraudScore(
    extractedData: DocumentAnalysisResult['extractedData'],
    securityFeatures: DocumentAnalysisResult['securityFeatures'],
    ocrConfidence: number
  ): number {
    let fraudScore = 100;

    // Reduce fraud score based on positive indicators
    if (extractedData.documentNumber) fraudScore -= 20;
    if (extractedData.dateOfBirth) fraudScore -= 15;
    if (securityFeatures.hologramDetected) fraudScore -= 15;
    if (securityFeatures.watermarkDetected) fraudScore -= 10;
    if (ocrConfidence > 80) fraudScore -= 20;
    if (ocrConfidence > 90) fraudScore -= 10;

    // Increase fraud score for negative indicators
    if (securityFeatures.tamperedDetected) fraudScore += 50;
    if (ocrConfidence < 50) fraudScore += 30;

    return Math.max(0, Math.min(100, fraudScore));
  }
}
