import { User } from '../user/entities/user.entity';
import { Tenant } from '../tenant/entities/tenant.entity';
import { TenantUser } from '../tenant-user/entities/tenant-user.entity';
import { ModeratorPortal } from '../moderator-portal/entities/moderator-portal.entity';

export const entities = [User, Tenant, TenantUser, ModeratorPortal];
