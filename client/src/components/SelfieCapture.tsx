import { useState } from "react";
import { Camera, Check, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SelfieCaptureProps {
  onCapture?: (imageData: string) => void;
  testId?: string;
}

export default function SelfieCapture({ onCapture, testId }: SelfieCaptureProps) {
  const [isCaptured, setIsCaptured] = useState(false);
  const [instruction, setInstruction] = useState("Position your face in the oval");

  const handleCapture = () => {
    setIsCaptured(true);
    setInstruction("Selfie captured successfully!");
    console.log('Selfie captured');
    onCapture?.('mock-image-data');
  };

  const handleRetake = () => {
    setIsCaptured(false);
    setInstruction("Position your face in the oval");
    console.log('Retake selfie');
  };

  return (
    <Card className="p-6 max-w-md mx-auto" data-testid={testId}>
      <div className="mb-4 text-center">
        <h3 className="text-xl font-semibold mb-2">Live Selfie Verification</h3>
        <p className="text-sm text-muted-foreground">{instruction}</p>
      </div>

      <div className="relative aspect-[3/4] bg-muted rounded-lg mb-6 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {!isCaptured && (
            <svg width="100%" height="100%" viewBox="0 0 300 400" className="absolute inset-0">
              <ellipse
                cx="150"
                cy="200"
                rx="120"
                ry="160"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="10,5"
                className="text-primary"
              />
            </svg>
          )}
          <div className="text-center">
            {isCaptured ? (
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-12 h-12 text-green-600" />
              </div>
            ) : (
              <Camera className="w-24 h-24 text-muted-foreground/50" />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        {!isCaptured ? (
          <Button className="w-full" size="lg" onClick={handleCapture} data-testid="button-capture">
            <Camera className="w-4 h-4 mr-2" />
            Capture Selfie
          </Button>
        ) : (
          <>
            <Button className="flex-1" variant="outline" onClick={handleRetake} data-testid="button-retake">
              <RotateCw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button className="flex-1" onClick={() => console.log('Continue with verification')} data-testid="button-continue">
              <Check className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </>
        )}
      </div>

      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <p className="text-xs text-muted-foreground text-center">
          Liveness detection active • Ensure good lighting • Look directly at camera
        </p>
      </div>
    </Card>
  );
}
