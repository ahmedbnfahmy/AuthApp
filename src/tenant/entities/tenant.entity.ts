import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TenantUser } from '../../tenant-user/entities/tenant-user.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  domainSlug: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @OneToMany(() => TenantUser, tenantUser => tenantUser.tenant)
  tenantUsers: TenantUser[];
}
