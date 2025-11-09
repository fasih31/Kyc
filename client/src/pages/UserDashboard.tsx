import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";
import { Shield, CheckCircle, Clock, FileText, User } from "lucide-react";
import RiskScoreDisplay from "@/components/RiskScoreDisplay";

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />
      
      <main className="container max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl">SJ</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Sarah</h1>
              <p className="text-muted-foreground">Last login: 2 hours ago</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Status</p>
                <p className="text-xl font-bold">Verified</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Documents</p>
                <p className="text-xl font-bold">2 Verified</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Last Verified</p>
                <p className="text-xl font-bold">2 days ago</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Digital Identity Wallet</h2>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-card hover-elevate" data-testid="wallet-passport">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Passport</p>
                      <p className="text-sm text-muted-foreground">US-123456789</p>
                    </div>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium">Dec 2028</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Risk Score</p>
                    <p className="font-medium font-mono text-green-600">95</p>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-card hover-elevate" data-testid="wallet-license">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Driver's License</p>
                      <p className="text-sm text-muted-foreground">DL-987654321</p>
                    </div>
                  </div>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Expires</p>
                    <p className="font-medium">Mar 2026</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Risk Score</p>
                    <p className="font-medium font-mono text-green-600">92</p>
                  </div>
                </div>
              </div>
            </div>

            <Button className="w-full mt-6" variant="outline" data-testid="button-add-document">
              <FileText className="w-4 h-4 mr-2" />
              Add New Document
            </Button>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-6">Trust Score</h2>
            <div className="flex flex-col items-center">
              <RiskScoreDisplay score={94} size="lg" />
              
              <div className="w-full mt-8 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Document Authenticity</span>
                  <span className="font-mono font-semibold text-green-600">98%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Biometric Match</span>
                  <span className="font-mono font-semibold text-green-600">96%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm">Behavior Analysis</span>
                  <span className="font-mono font-semibold text-green-600">89%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
