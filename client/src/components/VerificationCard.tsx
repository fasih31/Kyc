import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VerificationCardProps {
  id: string;
  userName: string;
  userPhoto?: string;
  documentType: string;
  documentPhoto?: string;
  status: 'pending' | 'verified' | 'rejected' | 'review';
  riskScore: number;
  timestamp: Date;
  onView?: () => void;
  testId?: string;
}

export default function VerificationCard({
  id,
  userName,
  userPhoto,
  documentType,
  documentPhoto,
  status,
  riskScore,
  timestamp,
  onView,
  testId
}: VerificationCardProps) {
  const statusConfig = {
    pending: { label: 'Pending', variant: 'secondary' as const, icon: Clock },
    verified: { label: 'Verified', variant: 'default' as const, icon: CheckCircle },
    rejected: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
    review: { label: 'Under Review', variant: 'secondary' as const, icon: Clock }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { label: 'Low Risk', color: 'text-green-600' };
    if (score >= 60) return { label: 'Medium Risk', color: 'text-yellow-600' };
    if (score >= 40) return { label: 'High Risk', color: 'text-orange-600' };
    return { label: 'Critical Risk', color: 'text-red-600' };
  };

  const riskLevel = getRiskLevel(riskScore);

  return (
    <Card className="p-6" data-testid={testId}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={userPhoto} />
            <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{userName}</h3>
            <p className="text-sm text-muted-foreground">{formatDistanceToNow(timestamp, { addSuffix: true })}</p>
          </div>
        </div>
        <Badge variant={config.variant} className="flex items-center gap-1" data-testid={`badge-status-${status}`}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Document Type</p>
          <p className="text-sm font-medium">{documentType}</p>
        </div>
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground mb-2">Risk Score</p>
          <p className={`text-2xl font-bold font-mono ${riskLevel.color}`}>{riskScore}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-sm text-muted-foreground">ID: {id}</span>
        <Button variant="outline" size="sm" onClick={onView} data-testid={`button-view-${id}`}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>
    </Card>
  );
}
