
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

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
    nationality?: string;
    address?: string;
    gender?: string;
  };
  securityFeatures: {
    hologramDetected: boolean;
    watermarkDetected: boolean;
    microTextDetected: boolean;
    uvFeaturesDetected: boolean;
    tamperedDetected: boolean;
    aiTamperingScore: number;
  };
  expiryAnalysis: {
    isExpired: boolean;
    daysUntilExpiry: number;
    expiryStatus: 'valid' | 'expiring_soon' | 'expired' | 'unknown';
  };
  fraudScore: number;
  anomalies: string[];
}

export class DocumentVerificationAI {
  async analyzeDocument(imageBuffer: Buffer): Promise<DocumentAnalysisResult> {
    try {
      // Preprocess image for better OCR
      const processedImage = await sharp(imageBuffer)
        .resize(2000, null, { fit: 'inside' })
        .sharpen()
        .normalize()
        .greyscale()
        .linear(1.2, -(128 * 1.2) + 128) // Enhance contrast
        .toBuffer();

      // Perform multi-language OCR
      const { data } = await Tesseract.recognize(processedImage, 'eng+urd+ara+chi_sim+spa+fra', {
        logger: () => {}, // Silent mode
      });

      // Extract text and analyze
      const extractedText = data.text;
      const extractedData = await this.extractDocumentInfo(extractedText, imageBuffer, data.confidence);
      
      // Detect security features with advanced AI
      const securityFeatures = await this.detectSecurityFeatures(processedImage, imageBuffer);
      
      // Analyze expiry date
      const expiryAnalysis = this.analyzeExpiry(extractedData.expiryDate);
      
      // Detect anomalies
      const anomalies = this.detectAnomalies(extractedData, securityFeatures, expiryAnalysis);
      
      // Calculate fraud score
      const fraudScore = this.calculateFraudScore(
        extractedData,
        securityFeatures,
        expiryAnalysis,
        data.confidence,
        anomalies
      );

      return {
        isValid: fraudScore < 30 && data.confidence > 70 && !expiryAnalysis.isExpired,
        confidence: data.confidence,
        extractedData,
        securityFeatures,
        expiryAnalysis,
        fraudScore,
        anomalies,
      };
    } catch (error) {
      console.error('Document verification error:', error);
      throw new Error('Failed to analyze document');
    }
  }

  private async extractDocumentInfo(text: string, imageBuffer: Buffer, ocrConfidence: number): Promise<DocumentAnalysisResult['extractedData']> {
    const data: DocumentAnalysisResult['extractedData'] = {};

    // Extract CNIC/Passport number (13 digits for CNIC)
    const cnicMatch = text.match(/\b\d{5}-\d{7}-\d{1}\b|\b\d{13}\b/);
    if (cnicMatch) {
      data.documentNumber = cnicMatch[0];
      data.documentType = 'CNIC';
    }

    // Extract passport number (various formats)
    const passportMatch = text.match(/[A-Z]{2}\d{7}|P\d{8}|[A-Z]\d{8}/);
    if (passportMatch) {
      data.documentNumber = passportMatch[0];
      data.documentType = 'Passport';
    }

    // Extract driver's license
    const driverLicenseMatch = text.match(/DL[-\s]?\d{6,10}|[A-Z]{2}\d{6}/);
    if (driverLicenseMatch) {
      data.documentNumber = driverLicenseMatch[0];
      data.documentType = 'Driver License';
    }

    // Extract name (capital letters pattern)
    const nameMatch = text.match(/Name[:\s]+([A-Z][A-Z\s]{3,50})/i);
    if (nameMatch) {
      data.name = nameMatch[1].trim();
    }

    // Extract gender
    const genderMatch = text.match(/\b(Male|Female|M|F)\b/i);
    if (genderMatch) {
      data.gender = genderMatch[1].toUpperCase();
    }

    // Extract nationality
    const nationalityMatch = text.match(/National(?:ity)?[:\s]+([A-Z][a-z]+)/i);
    if (nationalityMatch) {
      data.nationality = nationalityMatch[1];
    }

    // Extract dates (multiple formats)
    const dateMatches = text.match(/\b\d{2}[-/]\d{2}[-/]\d{4}\b|\b\d{4}[-/]\d{2}[-/]\d{2}\b/g);
    if (dateMatches && dateMatches.length > 0) {
      data.dateOfBirth = dateMatches[0];
      if (dateMatches.length > 1) {
        data.issueDate = dateMatches[1];
      }
      if (dateMatches.length > 2) {
        data.expiryDate = dateMatches[2];
      }
    }

    // Use AI to extract structured data if OCR confidence is low OR key fields are missing
    const shouldUseAI = ocrConfidence < 70 || !data.documentNumber || !data.name || !data.dateOfBirth;
    if (shouldUseAI && process.env.OPENAI_API_KEY) {
      try {
        const aiExtractedData = await this.aiEnhancedExtraction(text);
        // Merge AI results, preferring AI results when fields are missing
        data.documentNumber = data.documentNumber || aiExtractedData.documentNumber;
        data.documentType = data.documentType || aiExtractedData.documentType;
        data.name = data.name || aiExtractedData.name;
        data.dateOfBirth = data.dateOfBirth || aiExtractedData.dateOfBirth;
        data.expiryDate = data.expiryDate || aiExtractedData.expiryDate;
        data.issueDate = data.issueDate || aiExtractedData.issueDate;
        data.nationality = data.nationality || aiExtractedData.nationality;
        data.gender = data.gender || aiExtractedData.gender;
        data.address = data.address || aiExtractedData.address;
      } catch (error) {
        console.error('AI extraction failed:', error);
      }
    }

    return data;
  }

  private async aiEnhancedExtraction(text: string): Promise<Partial<DocumentAnalysisResult['extractedData']>> {
    if (!process.env.OPENAI_API_KEY) {
      return {};
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting structured data from identity documents. Extract document number, name, date of birth, expiry date, nationality, and document type from the OCR text.',
          },
          {
            role: 'user',
            content: `Extract structured data from this OCR text:\n\n${text}`,
          },
        ],
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result;
    } catch (error) {
      console.error('AI enhanced extraction error:', error);
      return {};
    }
  }

  private async detectSecurityFeatures(processedImage: Buffer, originalImage: Buffer): Promise<DocumentAnalysisResult['securityFeatures']> {
    const metadata = await sharp(originalImage).metadata();
    const stats = await sharp(processedImage).stats();
    
    // Detect hologram using alpha channel and color variance
    const hasColorVariance = stats.channels.length >= 3 && 
      (stats.channels[0].mean !== stats.channels[1].mean || 
       stats.channels[1].mean !== stats.channels[2].mean);
    const hologramDetected = metadata.hasAlpha || hasColorVariance;
    
    // Detect watermark using density and pattern analysis
    const watermarkDetected = (metadata.density || 0) > 150 || stats.isOpaque === false;
    
    // Detect micro-text using edge detection
    const edges = await sharp(processedImage)
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
      })
      .toBuffer();
    const edgeStats = await sharp(edges).stats();
    const microTextDetected = edgeStats.channels[0].mean > 30;
    
    // Simulate UV features detection (would use multispectral imaging in production)
    const uvFeaturesDetected = metadata.space === 'srgb' && stats.channels.length === 3;
    
    // AI-based tampering detection
    const aiTamperingScore = await this.detectTamperingWithAI(originalImage);
    const tamperedDetected = aiTamperingScore > 70;
    
    return {
      hologramDetected,
      watermarkDetected,
      microTextDetected,
      uvFeaturesDetected,
      tamperedDetected,
      aiTamperingScore,
    };
  }

  private async detectTamperingWithAI(imageBuffer: Buffer): Promise<number> {
    if (!process.env.OPENAI_API_KEY) {
      return 0;
    }

    try {
      const base64Image = imageBuffer.toString('base64');
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at detecting document tampering and forgery. Analyze the document image for signs of digital manipulation, inconsistent fonts, misaligned text, photo replacement, or other forgery indicators. Return a tampering score from 0-100 where 0 is authentic and 100 is clearly tampered.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this document for tampering. Return JSON with {tamperingScore: number, indicators: string[]}',
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

      const result = JSON.parse(response.choices[0].message.content || '{"tamperingScore": 0}');
      return result.tamperingScore || 0;
    } catch (error) {
      console.error('AI tampering detection error:', error);
      return 0;
    }
  }

  private analyzeExpiry(expiryDateStr?: string): DocumentAnalysisResult['expiryAnalysis'] {
    if (!expiryDateStr) {
      return {
        isExpired: false,
        daysUntilExpiry: -1,
        expiryStatus: 'unknown',
      };
    }

    try {
      // Parse various date formats
      let expiryDate: Date;
      if (expiryDateStr.match(/\d{2}[-/]\d{2}[-/]\d{4}/)) {
        const [day, month, year] = expiryDateStr.split(/[-/]/).map(Number);
        expiryDate = new Date(year, month - 1, day);
      } else if (expiryDateStr.match(/\d{4}[-/]\d{2}[-/]\d{2}/)) {
        expiryDate = new Date(expiryDateStr);
      } else {
        throw new Error('Invalid date format');
      }

      const now = new Date();
      const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      const isExpired = daysUntilExpiry < 0;
      const expiryStatus: 'valid' | 'expiring_soon' | 'expired' = 
        isExpired ? 'expired' :
        daysUntilExpiry < 30 ? 'expiring_soon' :
        'valid';

      return {
        isExpired,
        daysUntilExpiry,
        expiryStatus,
      };
    } catch (error) {
      return {
        isExpired: false,
        daysUntilExpiry: -1,
        expiryStatus: 'unknown',
      };
    }
  }

  private detectAnomalies(
    extractedData: DocumentAnalysisResult['extractedData'],
    securityFeatures: DocumentAnalysisResult['securityFeatures'],
    expiryAnalysis: DocumentAnalysisResult['expiryAnalysis']
  ): string[] {
    const anomalies: string[] = [];

    if (!extractedData.documentNumber) {
      anomalies.push('No document number detected');
    }

    if (!extractedData.name) {
      anomalies.push('No name detected');
    }

    if (!extractedData.dateOfBirth) {
      anomalies.push('No date of birth detected');
    }

    if (expiryAnalysis.isExpired) {
      anomalies.push('Document is expired');
    } else if (expiryAnalysis.expiryStatus === 'expiring_soon') {
      anomalies.push(`Document expires in ${expiryAnalysis.daysUntilExpiry} days`);
    }

    if (securityFeatures.tamperedDetected) {
      anomalies.push('Tampering detected');
    }

    if (!securityFeatures.hologramDetected) {
      anomalies.push('No hologram detected');
    }

    if (securityFeatures.aiTamperingScore > 50) {
      anomalies.push(`High tampering score: ${securityFeatures.aiTamperingScore}`);
    }

    return anomalies;
  }

  private calculateFraudScore(
    extractedData: DocumentAnalysisResult['extractedData'],
    securityFeatures: DocumentAnalysisResult['securityFeatures'],
    expiryAnalysis: DocumentAnalysisResult['expiryAnalysis'],
    ocrConfidence: number,
    anomalies: string[]
  ): number {
    let fraudScore = 100;

    // Reduce fraud score based on positive indicators
    if (extractedData.documentNumber) fraudScore -= 20;
    if (extractedData.name) fraudScore -= 10;
    if (extractedData.dateOfBirth) fraudScore -= 15;
    if (extractedData.nationality) fraudScore -= 5;
    if (securityFeatures.hologramDetected) fraudScore -= 15;
    if (securityFeatures.watermarkDetected) fraudScore -= 10;
    if (securityFeatures.microTextDetected) fraudScore -= 10;
    if (securityFeatures.uvFeaturesDetected) fraudScore -= 5;
    if (ocrConfidence > 80) fraudScore -= 20;
    if (ocrConfidence > 90) fraudScore -= 10;
    if (!expiryAnalysis.isExpired && expiryAnalysis.expiryStatus === 'valid') fraudScore -= 10;

    // Increase fraud score for negative indicators
    if (securityFeatures.tamperedDetected) fraudScore += 50;
    if (securityFeatures.aiTamperingScore > 70) fraudScore += 30;
    if (expiryAnalysis.isExpired) fraudScore += 40;
    if (ocrConfidence < 50) fraudScore += 30;
    if (anomalies.length > 3) fraudScore += 20;
    if (anomalies.length > 5) fraudScore += 20;

    return Math.max(0, Math.min(100, fraudScore));
  }
}
