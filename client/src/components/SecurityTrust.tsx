import { Shield, Lock, Eye, Database } from "lucide-react";

const securityFeatures = [
  "End-to-end AES-256 encryption",
  "Zero-knowledge proof architecture",
  "GDPR & SOC 2 compliant",
  "Blockchain audit ledger",
  "Real-time fraud detection",
  "User-controlled data sharing"
];

export default function SecurityTrust() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Security & Privacy First
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Built with enterprise-grade security and privacy-by-design principles. 
              Your data is encrypted, protected, and under your control.
            </p>
            <ul className="space-y-4">
              {securityFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3" data-testid={`security-feature-${index}`}>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border bg-card hover-elevate" data-testid="security-card-encryption">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Encrypted</h3>
              <p className="text-sm text-muted-foreground">Military-grade encryption at rest and in transit</p>
            </div>
            <div className="p-6 rounded-lg border bg-card hover-elevate" data-testid="security-card-private">
              <Lock className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Private</h3>
              <p className="text-sm text-muted-foreground">Zero-knowledge architecture protects your identity</p>
            </div>
            <div className="p-6 rounded-lg border bg-card hover-elevate" data-testid="security-card-transparent">
              <Eye className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Transparent</h3>
              <p className="text-sm text-muted-foreground">Full audit trail on blockchain ledger</p>
            </div>
            <div className="p-6 rounded-lg border bg-card hover-elevate" data-testid="security-card-compliant">
              <Database className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Compliant</h3>
              <p className="text-sm text-muted-foreground">Meets global data protection standards</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
