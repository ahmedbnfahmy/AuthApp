import { Request } from 'express';
import { ModeratorPortal } from '../../moderator-portal/entities/moderator-portal.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { TenantRole } from '../enums/tenant-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  tenant_id: string;
  portal_id?: string | null;
  role: TenantRole;
}

export interface RequestWithContext extends Request {
  tenant?: Tenant;
  portal?: ModeratorPortal | null;
  user?: JwtPayload;
  tenantId?: string;
}
