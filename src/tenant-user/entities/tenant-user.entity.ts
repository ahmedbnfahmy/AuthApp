import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('tenant_users')
export class TenantUser {
  @PrimaryColumn()
  tenantId: string;

  @PrimaryColumn()
  userId: string;

  @Column({ type: 'varchar', length: 50, default: 'member' })
  role: string;

  @ManyToOne(() => Tenant, tenant => tenant.tenantUsers)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @ManyToOne(() => User, user => user.tenantUsers)
  @JoinColumn({ name: 'userId' })
  user: User;
}
