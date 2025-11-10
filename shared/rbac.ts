
export type Permission = 
  | 'view_dashboard'
  | 'view_verifications'
  | 'manage_verifications'
  | 'view_members'
  | 'invite_members'
  | 'remove_members'
  | 'manage_roles'
  | 'configure_industry'
  | 'configure_thresholds'
  | 'view_fraud_alerts'
  | 'manage_fraud_alerts'
  | 'view_blockchain_audit'
  | 'manage_privacy_settings'
  | 'view_analytics'
  | 'export_data'
  | 'manage_billing'
  | 'manage_organization';

export type Role = 'super_admin' | 'admin' | 'manager' | 'reviewer' | 'viewer';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    'view_dashboard',
    'view_verifications',
    'manage_verifications',
    'view_members',
    'invite_members',
    'remove_members',
    'manage_roles',
    'configure_industry',
    'configure_thresholds',
    'view_fraud_alerts',
    'manage_fraud_alerts',
    'view_blockchain_audit',
    'manage_privacy_settings',
    'view_analytics',
    'export_data',
    'manage_billing',
    'manage_organization',
  ],
  admin: [
    'view_dashboard',
    'view_verifications',
    'manage_verifications',
    'view_members',
    'invite_members',
    'remove_members',
    'configure_industry',
    'configure_thresholds',
    'view_fraud_alerts',
    'manage_fraud_alerts',
    'view_blockchain_audit',
    'view_analytics',
    'export_data',
  ],
  manager: [
    'view_dashboard',
    'view_verifications',
    'manage_verifications',
    'view_members',
    'view_fraud_alerts',
    'view_analytics',
  ],
  reviewer: [
    'view_dashboard',
    'view_verifications',
    'view_members',
    'view_fraud_alerts',
    'view_analytics',
  ],
  viewer: [
    'view_dashboard',
    'view_verifications',
    'view_analytics',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}
