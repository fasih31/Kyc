
import sharp from 'sharp';
import * as tf from '@tensorflow/tfjs-node';

export interface FingerprintVerificationResult {
  isMatch: boolean;
  confidence: number;
  quality: number;
  minutiaeCount: number;
  spoofingDetected: boolean;
}

export interface PalmVeinVerificationResult {
  isMatch: boolean;
  confidence: number;
  veinPatternQuality: number;
  isLive: boolean;
}

export class BiometricVerificationAI {
  async verifyFingerprint(
    fingerprintBuffer: Buffer,
    storedTemplate?: Buffer
  ): Promise<FingerprintVerificationResult> {
    try {
      // Preprocess fingerprint image
      const processedImage = await sharp(fingerprintBuffer)
        .resize(512, 512)
        .greyscale()
        .normalize()
        .toBuffer();

      // Extract minutiae points (ridge endings and bifurcations)
      const minutiaeCount = await this.extractMinutiae(processedImage);
      const quality = await this.assessFingerprintQuality(processedImage);
      const spoofingDetected = await this.detectFingerprintSpoofing(processedImage);

      let isMatch = false;
      let confidence = 0;

      if (storedTemplate) {
        const matchResult = await this.matchFingerprints(processedImage, storedTemplate);
        isMatch = matchResult.score > 0.75;
        confidence = matchResult.score * 100;
      }

      return {
        isMatch,
        confidence,
        quality,
        minutiaeCount,
        spoofingDetected,
      };
    } catch (error) {
      console.error('Fingerprint verification error:', error);
      throw new Error('Failed to verify fingerprint');
    }
  }

  async verifyPalmVein(
    palmVeinBuffer: Buffer,
    storedTemplate?: Buffer
  ): Promise<PalmVeinVerificationResult> {
    try {
      // Preprocess palm vein image (typically uses near-infrared imaging)
      const processedImage = await sharp(palmVeinBuffer)
        .resize(640, 480)
        .greyscale()
        .normalize()
        .toBuffer();

      const veinPatternQuality = await this.assessVeinPatternQuality(processedImage);
      const isLive = await this.detectVeinLiveness(processedImage);

      let isMatch = false;
      let confidence = 0;

      if (storedTemplate) {
        const matchResult = await this.matchVeinPatterns(processedImage, storedTemplate);
        isMatch = matchResult.score > 0.80;
        confidence = matchResult.score * 100;
      }

      return {
        isMatch,
        confidence,
        veinPatternQuality,
        isLive,
      };
    } catch (error) {
      console.error('Palm vein verification error:', error);
      throw new Error('Failed to verify palm vein');
    }
  }

  private async extractMinutiae(imageBuffer: Buffer): Promise<number> {
    // Simplified minutiae extraction using edge detection
    const edges = await sharp(imageBuffer)
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
      })
      .toBuffer();

    const stats = await sharp(edges).stats();
    // Estimate minutiae count based on edge complexity
    return Math.floor(stats.channels[0].mean * 2);
  }

  private async assessFingerprintQuality(imageBuffer: Buffer): Promise<number> {
    const stats = await sharp(imageBuffer).stats();
    const metadata = await sharp(imageBuffer).metadata();

    let quality = 50;

    // Check contrast
    if (stats.channels[0].stdev > 40) quality += 20;
    
    // Check resolution
    if ((metadata.width || 0) >= 500 && (metadata.height || 0) >= 500) quality += 20;
    
    // Check sharpness
    const edges = await sharp(imageBuffer)
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
      })
      .toBuffer();
    const edgeStats = await sharp(edges).stats();
    if (edgeStats.channels[0].mean > 30) quality += 10;

    return Math.min(100, quality);
  }

  private async detectFingerprintSpoofing(imageBuffer: Buffer): Promise<boolean> {
    // Detect presentation attacks (fake fingerprints)
    const stats = await sharp(imageBuffer).stats();
    
    // Real fingerprints have specific texture characteristics
    const variance = stats.channels[0].stdev;
    
    // Too smooth or too noisy indicates spoofing
    return variance < 15 || variance > 80;
  }

  private async matchFingerprints(
    sample: Buffer,
    template: Buffer
  ): Promise<{ score: number }> {
    const sampleTensor = await this.bufferToTensor(sample);
    const templateTensor = await this.bufferToTensor(template);

    const similarity = this.calculateTensorSimilarity(sampleTensor, templateTensor);

    sampleTensor.dispose();
    templateTensor.dispose();

    return { score: similarity };
  }

  private async assessVeinPatternQuality(imageBuffer: Buffer): Promise<number> {
    const stats = await sharp(imageBuffer).stats();
    
    let quality = 50;
    
    // Vein patterns should have good contrast in NIR imaging
    if (stats.channels[0].stdev > 30) quality += 25;
    if (stats.channels[0].mean > 40 && stats.channels[0].mean < 200) quality += 25;

    return Math.min(100, quality);
  }

  private async detectVeinLiveness(imageBuffer: Buffer): Promise<boolean> {
    // Real vein patterns show blood flow characteristics
    const stats = await sharp(imageBuffer).stats();
    
    // Check for characteristics of live tissue
    const hasProperContrast = stats.channels[0].stdev > 25;
    const hasProperDensity = stats.channels[0].mean > 30 && stats.channels[0].mean < 220;
    
    return hasProperContrast && hasProperDensity;
  }

  private async matchVeinPatterns(
    sample: Buffer,
    template: Buffer
  ): Promise<{ score: number }> {
    const sampleTensor = await this.bufferToTensor(sample);
    const templateTensor = await this.bufferToTensor(template);

    const similarity = this.calculateTensorSimilarity(sampleTensor, templateTensor);

    sampleTensor.dispose();
    templateTensor.dispose();

    return { score: similarity };
  }

  private async bufferToTensor(buffer: Buffer): Promise<tf.Tensor3D> {
    const imageData = await sharp(buffer).raw().toBuffer();
    const tensor = tf.tensor3d(new Uint8Array(imageData), [512, 512, 1]);
    return tf.div(tensor, 255.0) as tf.Tensor3D;
  }

  private calculateTensorSimilarity(tensor1: tf.Tensor3D, tensor2: tf.Tensor3D): number {
    const flat1 = tensor1.flatten();
    const flat2 = tensor2.flatten();

    const dotProduct = tf.sum(tf.mul(flat1, flat2));
    const norm1 = tf.sqrt(tf.sum(tf.square(flat1)));
    const norm2 = tf.sqrt(tf.sum(tf.square(flat2)));

    const similarity = tf.div(dotProduct, tf.mul(norm1, norm2));
    const result = similarity.dataSync()[0];

    flat1.dispose();
    flat2.dispose();
    dotProduct.dispose();
    norm1.dispose();
    norm2.dispose();
    similarity.dispose();

    return result;
  }
}
