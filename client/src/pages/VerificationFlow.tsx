import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DocumentUpload from "@/components/DocumentUpload";
import SelfieCapture from "@/components/SelfieCapture";
import VerificationTimeline from "@/components/VerificationTimeline";
import RiskScoreDisplay from "@/components/RiskScoreDisplay";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function VerificationFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [, setLocation] = useLocation();

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

  // Placeholder for AI verification processing
  const processVerification = async () => {
    console.log('Starting AI verification...');
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate a verification result
    const result = {
      success: true,
      score: Math.floor(Math.random() * 100),
      documentMatch: Math.floor(Math.random() * 20) + 80, // 80-99%
      faceMatch: Math.floor(Math.random() * 20) + 80,     // 80-99%
    };
    setVerificationResult(result);
    console.log('AI verification complete:', result);
    handleNext(); // Move to the next step (results)
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
                  <Button onClick={processVerification} data-testid="button-start-processing">
                    Start AI Verification
                  </Button>
                </div>
              )}

              {currentStep === 3 && verificationResult && (
                <div className="text-center py-12">
                  {verificationResult.success ? (
                    <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-16 h-16 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </div>
                  )}
                  <h2 className="text-2xl font-bold mb-4">
                    {verificationResult.success ? 'Verification Complete!' : 'Verification Failed'}
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    {verificationResult.success
                      ? 'Your identity has been successfully verified'
                      : 'There was an issue verifying your identity. Please try again or contact support.'}
                  </p>

                  {verificationResult.success && (
                    <>
                      <div className="mb-8">
                        <RiskScoreDisplay score={verificationResult.score} size="lg" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <p className="text-sm text-muted-foreground mb-1">Document Match</p>
                          <p className="text-2xl font-bold font-mono text-green-600">{verificationResult.documentMatch}%</p>
                        </div>
                        <div className="p-4 border rounded-lg bg-muted/30">
                          <p className="text-sm text-muted-foreground mb-1">Face Match</p>
                          <p className="text-2xl font-bold font-mono text-green-600">{verificationResult.faceMatch}%</p>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex gap-4 justify-center">
                    {verificationResult.success && (
                      <Button variant="outline" data-testid="button-download">
                        Download Report
                      </Button>
                    )}
                    <Button onClick={() => setLocation('/')} data-testid="button-view-dashboard">
                      {verificationResult.success ? 'View Dashboard' : 'Try Again'}
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