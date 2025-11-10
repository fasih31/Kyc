
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { Shield, Eye, Lock, AlertCircle } from "lucide-react";

export default function PrivacySettings() {
  const [consents, setConsents] = useState([
    {
      id: "1",
      type: "Data Processing",
      purpose: "Identity Verification",
      scope: ["Document Images", "Biometric Data"],
      grantedTo: "Ali-V KYC System",
      isGranted: true,
      grantedAt: new Date(),
    },
    {
      id: "2",
      type: "Third-Party Sharing",
      purpose: "API Integration",
      scope: ["Trust Score", "Verification Status"],
      grantedTo: "Partner Services",
      isGranted: false,
      grantedAt: null,
    },
  ]);

  const toggleConsent = (id: string) => {
    setConsents(consents.map(consent => 
      consent.id === id 
        ? { ...consent, isGranted: !consent.isGranted, grantedAt: !consent.isGranted ? new Date() : null }
        : consent
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />

      <main className="container max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Privacy & Data Controls</h1>
          <p className="text-muted-foreground">Manage how your data is used and shared</p>
        </div>

        <Card className="p-6 mb-6 border-blue-200 bg-blue-50/50">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Your Data is Protected</h3>
              <p className="text-sm text-muted-foreground">
                All biometric data is encrypted and stored securely. You have full control over who can access your information.
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Consent Management</h2>
          
          {consents.map((consent) => (
            <Card key={consent.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{consent.type}</h3>
                    <Badge variant={consent.isGranted ? "default" : "secondary"}>
                      {consent.isGranted ? "Active" : "Revoked"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Purpose: {consent.purpose}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Granted to: {consent.grantedTo}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {consent.scope.map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Switch
                  checked={consent.isGranted}
                  onCheckedChange={() => toggleConsent(consent.id)}
                />
              </div>
              {consent.grantedAt && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {consent.grantedAt.toLocaleString()}
                </p>
              )}
            </Card>
          ))}
        </div>

        <Card className="p-6 mt-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Data Access Requests
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            You can request a copy of all your data or request deletion at any time.
          </p>
          <div className="flex gap-3">
            <Button variant="outline">Download My Data</Button>
            <Button variant="destructive">Request Account Deletion</Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
