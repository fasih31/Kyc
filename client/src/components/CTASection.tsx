import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Transform Your KYC Process?
        </h2>
        <p className="text-xl text-muted-foreground mb-10">
          Join thousands of organizations using Ali-V for secure, instant identity verification
        </p>
        <Button size="lg" className="text-base h-12 px-8" data-testid="button-get-started">
          Get Started Now
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
        <p className="text-sm text-muted-foreground mt-6">
          No credit card required • Setup in minutes • 24/7 support
        </p>
      </div>
    </section>
  );
}
