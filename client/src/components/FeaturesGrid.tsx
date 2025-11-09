import { Card } from "@/components/ui/card";
import aiScanIcon from "@assets/generated_images/AI_document_scanning_icon_0f0c63d3.png";
import biometricIcon from "@assets/generated_images/Biometric_verification_icon_d1991377.png";
import riskIcon from "@assets/generated_images/Risk_scoring_security_icon_b4448fc2.png";

const features = [
  {
    icon: aiScanIcon,
    title: "AI Document Verification",
    description: "Advanced OCR and deep learning models extract and verify data from any government ID, passport, or license with 99.9% accuracy."
  },
  {
    icon: biometricIcon,
    title: "Biometric Matching",
    description: "3D face recognition with liveness detection ensures the person presenting the ID is the rightful owner, preventing fraud."
  },
  {
    icon: riskIcon,
    title: "Intelligent Risk Scoring",
    description: "Real-time AI analysis detects synthetic identities, deepfakes, and anomalies, providing comprehensive trust scores."
  }
];

export default function FeaturesGrid() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Powered by Advanced AI</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Multi-modal verification combining document intelligence, biometrics, and behavioral analysis
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 hover-elevate" data-testid={`card-feature-${index}`}>
              <div className="mb-6">
                <img src={feature.icon} alt={feature.title} className="w-24 h-24 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">{feature.title}</h3>
              <p className="text-muted-foreground text-center">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
