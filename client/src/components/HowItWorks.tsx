import { Upload, Scan, UserCheck, Shield } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Document",
    description: "Capture or upload your government-issued ID in seconds"
  },
  {
    number: "02",
    icon: Scan,
    title: "AI Verification",
    description: "Our AI extracts and validates all document information"
  },
  {
    number: "03",
    icon: UserCheck,
    title: "Biometric Match",
    description: "Live selfie verification with liveness detection"
  },
  {
    number: "04",
    icon: Shield,
    title: "Risk Assessment",
    description: "Receive comprehensive verification and trust score"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-card/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete verification in 4 simple steps, powered by AI
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative" data-testid={`step-${index}`}>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-border" />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6">
                  <step.icon className="w-12 h-12 text-primary" />
                </div>
                <div className="text-5xl font-bold font-mono text-primary/30 mb-2">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
