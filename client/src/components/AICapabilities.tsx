
import { Brain, Shield, Zap, Eye, Fingerprint, Globe } from 'lucide-react';
import { Card } from './ui/card';

export default function AICapabilities() {
  const capabilities = [
    {
      icon: Brain,
      title: 'Multi-Modal AI Verification',
      description: 'Combines document OCR, face recognition, and liveness detection using TensorFlow and advanced CV algorithms',
    },
    {
      icon: Eye,
      title: 'Anti-Spoofing Detection',
      description: 'AI-powered deepfake detection and presentation attack prevention with 99%+ accuracy',
    },
    {
      icon: Fingerprint,
      title: 'Biometric Authentication',
      description: 'Support for face, fingerprint, and palm vein verification with adaptive risk scoring',
    },
    {
      icon: Shield,
      title: 'Fraud Prevention AI',
      description: 'Real-time anomaly detection, synthetic identity detection, and adaptive risk scoring',
    },
    {
      icon: Globe,
      title: 'Multilingual Support',
      description: 'OCR support for Urdu, English, Arabic and regional languages on government documents',
    },
    {
      icon: Zap,
      title: 'Real-Time Processing',
      description: 'Sub-second verification with blockchain audit logs and zero-knowledge proof integration',
    },
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Advanced AI & Machine Learning Stack
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powered by state-of-the-art AI libraries including TensorFlow, Tesseract OCR, 
            and custom-trained models for government-grade security
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{capability.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {capability.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
          <h3 className="font-semibold mb-3 text-center">Technology Stack Highlights</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-mono text-xs mb-1 text-muted-foreground">Computer Vision & OCR:</p>
              <p>TensorFlow.js, Tesseract OCR, Sharp, Face-API.js</p>
            </div>
            <div>
              <p className="font-mono text-xs mb-1 text-muted-foreground">AI/ML Models:</p>
              <p>Custom-trained fraud detection, liveness detection, risk scoring</p>
            </div>
            <div>
              <p className="font-mono text-xs mb-1 text-muted-foreground">Security:</p>
              <p>Zero-knowledge proofs, blockchain audit logs, encrypted storage</p>
            </div>
            <div>
              <p className="font-mono text-xs mb-1 text-muted-foreground">Performance:</p>
              <p>Sub-second verification, real-time processing, adaptive AI</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
