import { TenantRole } from '../enums/tenant-role.enum';

const ASSIGNABLE_ROLES: Record<TenantRole, TenantRole[]> = {
  [TenantRole.Admin]: [
    TenantRole.Admin,
    TenantRole.Moderator,
    TenantRole.Cashier,
    TenantRole.Customer,
  ],
  [TenantRole.Moderator]: [TenantRole.Cashier, TenantRole.Customer],
  [TenantRole.Cashier]: [],
  [TenantRole.Customer]: [],
};

export function canAssignRole(
  actor: TenantRole,
  target: TenantRole,
): boolean {
  return ASSIGNABLE_ROLES[actor]?.includes(target) ?? false;
}

export type HostType = 'tenant' | 'portal';

export function rolesAllowedOnHost(hostType: HostType): TenantRole[] {
  if (hostType === 'tenant') {
    return [TenantRole.Admin];
  }
  return [TenantRole.Moderator, TenantRole.Cashier, TenantRole.Customer];
}

export function isRoleAllowedOnHost(
  role: TenantRole,
  hostType: HostType,
): boolean {
  return rolesAllowedOnHost(hostType).includes(role);
}

export function requiresPortalId(role: TenantRole): boolean {
  return (
    role === TenantRole.Moderator ||
    role === TenantRole.Cashier ||
    role === TenantRole.Customer
  );
}
