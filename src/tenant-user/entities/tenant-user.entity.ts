import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { TenantRole } from '../../common/enums/tenant-role.enum';
import { ModeratorPortal } from '../../moderator-portal/entities/moderator-portal.entity';
import { User } from '../../user/entities/user.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('tenant_users')
export class TenantUser {
  @PrimaryColumn()
  tenantId: string;

  @PrimaryColumn()
  userId: string;

  @Column({ type: 'varchar', length: 50, default: TenantRole.Customer })
  role: TenantRole;

  @Column({ type: 'uuid', nullable: true })
  portalId: string | null;

  @ManyToOne(() => Tenant, (tenant) => tenant.tenantUsers)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User, (user) => user.tenantUsers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => ModeratorPortal, { nullable: true })
  @JoinColumn({ name: 'portalId' })
  portal: ModeratorPortal | null;
}
