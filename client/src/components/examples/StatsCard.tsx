import StatsCard from '../StatsCard';
import { Users, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      <StatsCard 
        title="Total Verifications" 
        value="1,247" 
        icon={Users}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard 
        title="Approved" 
        value="1,089" 
        icon={CheckCircle}
        trend={{ value: 8, isPositive: true }}
      />
      <StatsCard 
        title="Pending Review" 
        value="124" 
        icon={Clock}
      />
      <StatsCard 
        title="Flagged" 
        value="34" 
        icon={AlertTriangle}
        trend={{ value: 5, isPositive: false }}
      />
    </div>
  );
}
