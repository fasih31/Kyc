
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import Header from "@/components/Header";
import { Building2, Shield, Settings } from "lucide-react";

const INDUSTRIES = [
  { id: 'BANKING', name: 'Banking & Finance', icon: '🏦' },
  { id: 'GOVERNMENT', name: 'Government', icon: '🏛️' },
  { id: 'CRYPTOCURRENCY', name: 'Cryptocurrency', icon: '₿' },
  { id: 'FINTECH', name: 'FinTech', icon: '💳' },
  { id: 'HEALTHCARE', name: 'Healthcare', icon: '🏥' },
  { id: 'ECOMMERCE', name: 'E-Commerce', icon: '🛒' },
  { id: 'GAMING', name: 'Gaming', icon: '🎮' },
  { id: 'TELECOM', name: 'Telecommunications', icon: '📱' },
  { id: 'INSURANCE', name: 'Insurance', icon: '🛡️' },
  { id: 'CUSTOM', name: 'Custom Configuration', icon: '⚙️' },
];

export default function IndustrySelector() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ECOMMERCE');
  const [customConfig, setCustomConfig] = useState({
    documentVerification: true,
    faceVerification: true,
    livenessDetection: true,
    fingerprintVerification: false,
    palmVeinVerification: false,
    voiceVerification: false,
    behavioralAnalytics: true,
    syntheticIdentityDetection: false,
    blockchainAudit: false,
    autoApproveThreshold: 70,
    manualReviewThreshold: 50,
    autoRejectThreshold: 30,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />
      
      <main className="container max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            Industry KYC Configuration
          </h1>
          <p className="text-muted-foreground">
            Select your industry or customize verification requirements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Select Industry Preset
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {INDUSTRIES.map((industry) => (
                  <button
                    key={industry.id}
                    onClick={() => setSelectedIndustry(industry.id)}
                    className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                      selectedIndustry === industry.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{industry.icon}</div>
                    <div className="text-sm font-medium">{industry.name}</div>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Verification Requirements
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(customConfig).filter(([key]) => !key.includes('Threshold')).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value as boolean}
                        onCheckedChange={(checked) =>
                          setCustomConfig({ ...customConfig, [key]: checked })
                        }
                      />
                      <Label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Risk Score Thresholds</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block">
                        Auto Approve: {customConfig.autoApproveThreshold}+
                      </Label>
                      <Slider
                        value={[customConfig.autoApproveThreshold]}
                        onValueChange={([value]) =>
                          setCustomConfig({ ...customConfig, autoApproveThreshold: value })
                        }
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">
                        Manual Review: {customConfig.manualReviewThreshold}+
                      </Label>
                      <Slider
                        value={[customConfig.manualReviewThreshold]}
                        onValueChange={([value]) =>
                          setCustomConfig({ ...customConfig, manualReviewThreshold: value })
                        }
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>

                    <div>
                      <Label className="text-sm mb-2 block">
                        Auto Reject: Below {customConfig.autoRejectThreshold}
                      </Label>
                      <Slider
                        value={[customConfig.autoRejectThreshold]}
                        onValueChange={([value]) =>
                          setCustomConfig({ ...customConfig, autoRejectThreshold: value })
                        }
                        min={0}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6" size="lg">
                  Save Configuration & Start Verification
                </Button>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="font-semibold mb-4">Configuration Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Industry:</span>
                  <Badge className="ml-2">
                    {INDUSTRIES.find((i) => i.id === selectedIndustry)?.name}
                  </Badge>
                </div>
                
                <div className="pt-3 border-t">
                  <span className="text-muted-foreground block mb-2">Active Checks:</span>
                  <div className="space-y-1">
                    {Object.entries(customConfig)
                      .filter(([key, value]) => !key.includes('Threshold') && value)
                      .map(([key]) => (
                        <div key={key} className="text-xs flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <span className="text-muted-foreground block mb-2">Risk Thresholds:</span>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Auto Approve:</span>
                      <span className="font-mono text-green-600">
                        ≥{customConfig.autoApproveThreshold}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manual Review:</span>
                      <span className="font-mono text-yellow-600">
                        {customConfig.manualReviewThreshold}-{customConfig.autoApproveThreshold - 1}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto Reject:</span>
                      <span className="font-mono text-red-600">
                        &lt;{customConfig.autoRejectThreshold}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
