import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ModeratorPortal } from '../../moderator-portal/entities/moderator-portal.entity';
import { TenantUser } from '../../tenant-user/entities/tenant-user.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  domainSlug: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  customDomain: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @OneToMany(() => TenantUser, (tenantUser) => tenantUser.tenant)
  tenantUsers: TenantUser[];

  @OneToMany(() => ModeratorPortal, (portal) => portal.tenant)
  moderatorPortals: ModeratorPortal[];
}
