import { Button } from "@/components/ui/button";
import { Shield, Zap, Lock } from "lucide-react";
import heroBackground from "@assets/generated_images/Futuristic_KYC_hero_background_a455a136.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Enterprise-Grade Security</span>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
          Ali-V Identity Verification
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
          The future of KYC is here. AI-powered identity verification with biometric authentication, 
          fraud detection, and real-time risk scoring in under 2 minutes.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center mb-16">
          <Button size="lg" className="text-base h-12 px-8" data-testid="button-start-verification">
            Start Verification
            <Zap className="ml-2 w-4 h-4" />
          </Button>
          <Button size="lg" variant="outline" className="text-base h-12 px-8 bg-background/50 backdrop-blur-sm" data-testid="button-view-demo">
            View Demo
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl font-bold font-mono text-primary">50K+</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Verifications</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl font-bold font-mono text-primary">99.9%</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Accuracy</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl font-bold font-mono text-primary">&lt; 2min</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wide">Average Time</div>
          </div>
        </div>
      </div>
    </section>
  );
}
