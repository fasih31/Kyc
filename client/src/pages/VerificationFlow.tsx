import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DocumentUpload from "@/components/DocumentUpload";
import SelfieCapture from "@/components/SelfieCapture";
import VerificationTimeline from "@/components/VerificationTimeline";
import RiskScoreDisplay from "@/components/RiskScoreDisplay";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";

export default function VerificationFlow() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Upload Document", component: "upload" },
    { title: "Capture Selfie", component: "selfie" },
    { title: "Processing", component: "processing" },
    { title: "Complete", component: "complete" }
  ];

  const timelineSteps = [
    {
      title: 'Document Uploaded',
      description: 'Document received and queued for processing',
      status: currentStep >= 1 ? 'completed' as const : 'pending' as const,
      timestamp: currentStep >= 1 ? 'Just now' : undefined
    },
    {
      title: 'AI Verification',
      description: 'OCR extraction and document validation',
      status: currentStep >= 2 ? 'completed' as const : currentStep === 1 ? 'current' as const : 'pending' as const
    },
    {
      title: 'Biometric Match',
      description: 'Face matching with document photo',
      status: currentStep >= 3 ? 'completed' as const : currentStep === 2 ? 'current' as const : 'pending' as const
    },
    {
      title: 'Risk Assessment',
      description: 'Comprehensive fraud and anomaly detection',
      status: currentStep >= 3 ? 'completed' as const : 'pending' as const
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      console.log('Moving to step:', currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      console.log('Moving to step:', currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />
      
      <main className="container max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Identity Verification</h1>
          <p className="text-muted-foreground">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-8">
              {currentStep === 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Upload Your Document</h2>
                  <p className="text-muted-foreground mb-6">
                    Please upload a clear photo of your government-issued ID, passport, or driver's license
                  </p>
                  <DocumentUpload onUpload={() => console.log('Document uploaded')} />
                  <div className="flex justify-end mt-6">
                    <Button onClick={handleNext} data-testid="button-next">
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-center">Capture Your Selfie</h2>
                  <p className="text-muted-foreground mb-6 text-center">
                    We'll use this to verify your identity matches your document
                  </p>
                  <SelfieCapture onCapture={() => console.log('Selfie captured')} />
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack} data-testid="button-back">
                      <ArrowLeft className="mr-2 w-4 h-4" />
                      Back
                    </Button>
                    <Button onClick={handleNext} data-testid="button-next-selfie">
                      Continue
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Processing Your Verification</h2>
                  <p className="text-muted-foreground mb-8">
                    Our AI is analyzing your documents and biometric data. This usually takes less than 30 seconds.
                  </p>
                  <Button onClick={handleNext} data-testid="button-skip-processing">
                    Skip to Results (Demo)
                  </Button>
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Verification Complete!</h2>
                  <p className="text-muted-foreground mb-8">
                    Your identity has been successfully verified
                  </p>
                  
                  <div className="mb-8">
                    <RiskScoreDisplay score={94} size="lg" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Document Match</p>
                      <p className="text-2xl font-bold font-mono text-green-600">98%</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-muted/30">
                      <p className="text-sm text-muted-foreground mb-1">Face Match</p>
                      <p className="text-2xl font-bold font-mono text-green-600">96%</p>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" data-testid="button-download">
                      Download Report
                    </Button>
                    <Button data-testid="button-view-dashboard">
                      View Dashboard
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Verification Progress</h3>
              <VerificationTimeline steps={timelineSteps} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
