
import { db } from "../db";
import { organizations, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { IndustryKYCConfig } from "@shared/industryConfig";
import type { Role, Permission } from "@shared/rbac";
import { hasPermission } from "@shared/rbac";

export class OrganizationService {
  async createOrganization(name: string, industry: string, kycConfig: IndustryKYCConfig) {
    const [org] = await db.insert(organizations).values({
      name,
      industry,
      kycConfig: kycConfig as any,
    }).returning();
    
    return org;
  }

  async updateOrganizationConfig(orgId: string, kycConfig: Partial<IndustryKYCConfig>) {
    const [org] = await db.update(organizations)
      .set({ 
        kycConfig: kycConfig as any,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, orgId))
      .returning();
    
    return org;
  }

  async getOrganizationMembers(orgId: string) {
    return await db.select()
      .from(users)
      .where(eq(users.organizationId, orgId));
  }

  async updateMemberRole(userId: number, newRole: Role, requestingUserRole: Role) {
    // Only admins and super_admins can change roles
    if (!hasPermission(requestingUserRole, 'manage_roles')) {
      throw new Error('Insufficient permissions to change roles');
    }

    const [user] = await db.update(users)
      .set({ role: newRole })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async removeMember(userId: number, requestingUserRole: Role) {
    if (!hasPermission(requestingUserRole, 'remove_members')) {
      throw new Error('Insufficient permissions to remove members');
    }

    await db.delete(users).where(eq(users.id, userId));
  }

  async checkPermission(userId: number, permission: Permission): Promise<boolean> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (!user) return false;
    
    return hasPermission(user.role as Role, permission);
  }
}
