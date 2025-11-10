
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import { Building2, Users, Shield, Settings, UserPlus, Trash2, Edit } from "lucide-react";
import type { Role } from "@shared/rbac";

interface Member {
  id: number;
  username: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export default function OrganizationSettings() {
  const [members, setMembers] = useState<Member[]>([
    {
      id: 1,
      username: "john_admin",
      email: "john@company.com",
      role: "admin",
      createdAt: new Date(),
    },
    {
      id: 2,
      username: "sarah_reviewer",
      email: "sarah@company.com",
      role: "reviewer",
      createdAt: new Date(),
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("viewer");

  const roleColors: Record<Role, string> = {
    super_admin: "bg-purple-500",
    admin: "bg-red-500",
    manager: "bg-orange-500",
    reviewer: "bg-blue-500",
    viewer: "bg-gray-500",
  };

  const handleInvite = () => {
    console.log("Invite member:", inviteEmail, inviteRole);
    setInviteEmail("");
  };

  const handleRoleChange = (memberId: number, newRole: Role) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  };

  const handleRemoveMember = (memberId: number) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" />
      
      <main className="container max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            Organization Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your organization members, roles, and permissions
          </p>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="w-4 h-4 mr-2" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="general">
              <Settings className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Invite New Member
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="reviewer">Reviewer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleInvite} className="mt-4">
                Send Invitation
              </Button>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Organization Members ({members.length})</h2>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold">{member.username[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{member.username}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={member.role}
                        onValueChange={(v) => handleRoleChange(member.id, v as Role)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="reviewer">Reviewer</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Role Permissions Matrix</h2>
              <div className="space-y-4">
                {(['super_admin', 'admin', 'manager', 'reviewer', 'viewer'] as Role[]).map((role) => (
                  <div key={role} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${roleColors[role]}`} />
                        <h3 className="font-semibold capitalize">{role.replace('_', ' ')}</h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {role === 'super_admin' && (
                        <>
                          <Badge variant="outline">All Permissions</Badge>
                          <Badge variant="outline">Manage Organization</Badge>
                          <Badge variant="outline">Manage Billing</Badge>
                          <Badge variant="outline">Full Control</Badge>
                        </>
                      )}
                      {role === 'admin' && (
                        <>
                          <Badge variant="outline">Manage Verifications</Badge>
                          <Badge variant="outline">Manage Members</Badge>
                          <Badge variant="outline">Configure Industry</Badge>
                          <Badge variant="outline">View Analytics</Badge>
                        </>
                      )}
                      {role === 'manager' && (
                        <>
                          <Badge variant="outline">Manage Verifications</Badge>
                          <Badge variant="outline">View Members</Badge>
                          <Badge variant="outline">View Fraud Alerts</Badge>
                        </>
                      )}
                      {role === 'reviewer' && (
                        <>
                          <Badge variant="outline">View Verifications</Badge>
                          <Badge variant="outline">View Fraud Alerts</Badge>
                        </>
                      )}
                      {role === 'viewer' && (
                        <>
                          <Badge variant="outline">View Dashboard</Badge>
                          <Badge variant="outline">View Analytics</Badge>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Organization Details</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input id="org-name" defaultValue="Acme Corporation" />
                </div>
                <div>
                  <Label htmlFor="org-industry">Industry</Label>
                  <Select defaultValue="BANKING">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANKING">Banking & Finance</SelectItem>
                      <SelectItem value="GOVERNMENT">Government</SelectItem>
                      <SelectItem value="CRYPTOCURRENCY">Cryptocurrency</SelectItem>
                      <SelectItem value="FINTECH">FinTech</SelectItem>
                      <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Changes</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
