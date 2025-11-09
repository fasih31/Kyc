import Hero from "@/components/Hero";
import FeaturesGrid from "@/components/FeaturesGrid";
import HowItWorks from "@/components/HowItWorks";
import SecurityTrust from "@/components/SecurityTrust";
import CTASection from "@/components/CTASection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Header variant="landing" />
      <main>
        <Hero />
        <div id="features">
          <FeaturesGrid />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="security">
          <SecurityTrust />
        </div>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
