
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Shield, Smartphone, Camera } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function MobileLogin() {
  const [step, setStep] = useState<'mobile' | 'otp' | 'face-setup' | 'face-verify'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const sendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "OTP Sent",
          description: data.message,
        });
        setStep('otp');
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setToken(data.token);
        setUserId(data.userId);
        
        if (data.requiresFaceSetup) {
          setStep('face-setup');
          startCamera();
        } else {
          setStep('face-verify');
          startCamera();
        }

        toast({
          title: "OTP Verified",
          description: "Please complete face verification",
        });
      } else {
        toast({
          title: "Error",
          description: "Invalid OTP",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to access camera",
        variant: "destructive",
      });
    }
  };

  const captureAndVerifyFace = async () => {
    if (!videoRef.current || !stream) return;

    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg');
      });

      const formData = new FormData();
      formData.append('face', blob);

      if (step === 'face-setup') {
        formData.append('userId', userId);
        
        const response = await fetch('/api/auth/setup-face', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Success",
            description: "Face verification setup complete",
          });
          setStep('face-verify');
        } else {
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive",
          });
        }
      } else {
        formData.append('token', token);
        
        const response = await fetch('/api/auth/verify-face', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          // Store token in localStorage
          localStorage.setItem('authToken', token);
          
          // Stop camera
          stream.getTracks().forEach(track => track.stop());
          
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          
          setLocation('/dashboard');
        } else {
          toast({
            title: "Error",
            description: data.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Face verification failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Ali-V Login</h1>
          <p className="text-muted-foreground">Secure authentication with mobile & face verification</p>
        </div>

        {step === 'mobile' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            <Button 
              onClick={sendOTP} 
              disabled={loading || !mobileNumber}
              className="w-full"
            >
              <Smartphone className="mr-2 w-4 h-4" />
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <Label>Enter 6-digit OTP</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Sent to {mobileNumber}
              </p>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup className="w-full justify-center">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button 
              onClick={verifyOTP} 
              disabled={loading || otp.length !== 6}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setStep('mobile')}
              className="w-full"
            >
              Change Number
            </Button>
          </div>
        )}

        {(step === 'face-setup' || step === 'face-verify') && (
          <div className="space-y-4">
            <div>
              <Label>
                {step === 'face-setup' ? 'Setup Face Verification' : 'Verify Your Face'}
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                {step === 'face-setup' 
                  ? 'Position your face in the frame and capture' 
                  : 'Look at the camera to verify your identity'}
              </p>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <Button 
              onClick={captureAndVerifyFace} 
              disabled={loading}
              className="w-full"
            >
              <Camera className="mr-2 w-4 h-4" />
              {loading ? 'Processing...' : step === 'face-setup' ? 'Capture Face' : 'Verify Face'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
