import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import VerificationCard from "@/components/VerificationCard";
import { Users, CheckCircle, AlertTriangle, Clock, Search, Filter } from "lucide-react";

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [fraudAlerts, setFraudAlerts] = useState([
    {
      id: "FRAUD-001",
      type: "Document Tampering",
      severity: "high",
      userName: "Suspicious User",
      timestamp: new Date(),
    },
    {
      id: "FRAUD-002",
      type: "Expired Document",
      severity: "medium",
      userName: "John Doe",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
  ]);

  const mockVerifications = [
    {
      id: "VER-2024-001",
      userName: "Sarah Johnson",
      documentType: "Passport",
      status: "verified" as const,
      riskScore: 92,
      timestamp: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      id: "VER-2024-002",
      userName: "Michael Chen",
      documentType: "Driver's License",
      status: "pending" as const,
      riskScore: 85,
      timestamp: new Date(Date.now() - 1000 * 60 * 15)
    },
    {
      id: "VER-2024-003",
      userName: "Emma Wilson",
      documentType: "National ID",
      status: "review" as const,
      riskScore: 67,
      timestamp: new Date(Date.now() - 1000 * 60 * 45)
    },
    {
      id: "VER-2024-004",
      userName: "James Rodriguez",
      documentType: "Passport",
      status: "rejected" as const,
      riskScore: 32,
      timestamp: new Date(Date.now() - 1000 * 60 * 60)
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />
      
      <main className="container max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage verification requests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Verifications" 
            value="1,247" 
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            testId="stats-total"
          />
          <StatsCard 
            title="Approved" 
            value="1,089" 
            icon={CheckCircle}
            trend={{ value: 8, isPositive: true }}
            testId="stats-approved"
          />
          <StatsCard 
            title="Pending Review" 
            value="124" 
            icon={Clock}
            testId="stats-pending"
          />
          <StatsCard 
            title="Flagged" 
            value="34" 
            icon={AlertTriangle}
            trend={{ value: 5, isPositive: false }}
            testId="stats-flagged"
          />
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, ID, or document type..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
            <Button variant="outline" data-testid="button-filter">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </Card>

        <Card className="p-6 mb-6 border-orange-200 bg-orange-50/50">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Fraud Alerts ({fraudAlerts.length})
          </h3>
          <div className="space-y-3">
            {fraudAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${alert.severity === 'high' ? 'bg-red-500' : 'bg-orange-500'}`} />
                  <div>
                    <p className="font-semibold text-sm">{alert.type}</p>
                    <p className="text-xs text-muted-foreground">{alert.userName} • {alert.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Investigate</Button>
              </div>
            ))}
          </div>
        </Card>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
            <TabsTrigger value="verified" data-testid="tab-verified">Verified</TabsTrigger>
            <TabsTrigger value="flagged" data-testid="tab-flagged">Flagged</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockVerifications.map((verification) => (
                <VerificationCard
                  key={verification.id}
                  {...verification}
                  onView={() => console.log('View verification:', verification.id)}
                  testId={`verification-${verification.id}`}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockVerifications.filter(v => v.status === 'pending').map((verification) => (
                <VerificationCard
                  key={verification.id}
                  {...verification}
                  onView={() => console.log('View verification:', verification.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verified" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockVerifications.filter(v => v.status === 'verified').map((verification) => (
                <VerificationCard
                  key={verification.id}
                  {...verification}
                  onView={() => console.log('View verification:', verification.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="flagged" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockVerifications.filter(v => v.status === 'rejected' || v.riskScore < 50).map((verification) => (
                <VerificationCard
                  key={verification.id}
                  {...verification}
                  onView={() => console.log('View verification:', verification.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
