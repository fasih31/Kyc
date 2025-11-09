import { CheckCircle2, Circle, Clock } from "lucide-react";

interface TimelineStep {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
}

interface VerificationTimelineProps {
  steps: TimelineStep[];
  testId?: string;
}

export default function VerificationTimeline({ steps, testId }: VerificationTimelineProps) {
  return (
    <div className="space-y-6" data-testid={testId}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const Icon = step.status === 'completed' ? CheckCircle2 : step.status === 'current' ? Clock : Circle;
        
        return (
          <div key={index} className="relative" data-testid={`timeline-step-${index}`}>
            {!isLast && (
              <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${
                step.status === 'completed' ? 'bg-primary' : 'bg-border'
              }`} />
            )}
            
            <div className="flex gap-4">
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.status === 'completed' ? 'bg-primary text-primary-foreground' :
                step.status === 'current' ? 'bg-primary/20 text-primary' :
                'bg-muted text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 pt-1">
                <h4 className="font-semibold mb-1">{step.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">{step.description}</p>
                {step.timestamp && (
                  <p className="text-xs text-muted-foreground">{step.timestamp}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
