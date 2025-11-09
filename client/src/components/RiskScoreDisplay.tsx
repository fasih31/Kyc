import { Card } from "@/components/ui/card";

interface RiskScoreDisplayProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  testId?: string;
}

export default function RiskScoreDisplay({ score, size = 'md', showDetails = true, testId }: RiskScoreDisplayProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Low Risk', color: '#22c55e', bgColor: 'bg-green-500/10' };
    if (score >= 60) return { label: 'Medium Risk', color: '#eab308', bgColor: 'bg-yellow-500/10' };
    if (score >= 40) return { label: 'High Risk', color: '#f97316', bgColor: 'bg-orange-500/10' };
    return { label: 'Critical Risk', color: '#ef4444', bgColor: 'bg-red-500/10' };
  };

  const riskLevel = getRiskLevel(score);
  
  const sizes = {
    sm: { circle: 100, stroke: 8, text: 'text-2xl' },
    md: { circle: 140, stroke: 10, text: 'text-4xl' },
    lg: { circle: 180, stroke: 12, text: 'text-5xl' }
  };
  
  const config = sizes[size];
  const radius = (config.circle - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center" data-testid={testId}>
      <div className="relative">
        <svg width={config.circle} height={config.circle} className="transform -rotate-90">
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={config.stroke}
            fill="none"
            className="text-muted"
          />
          <circle
            cx={config.circle / 2}
            cy={config.circle / 2}
            r={radius}
            stroke={riskLevel.color}
            strokeWidth={config.stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.text} font-bold font-mono`} style={{ color: riskLevel.color }}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Score</span>
        </div>
      </div>
      
      {showDetails && (
        <div className={`mt-4 px-4 py-2 rounded-full ${riskLevel.bgColor}`}>
          <span className="text-sm font-medium" style={{ color: riskLevel.color }}>
            {riskLevel.label}
          </span>
        </div>
      )}
    </div>
  );
}
