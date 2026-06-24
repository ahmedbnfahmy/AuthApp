import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('moderator_portals')
@Unique(['tenantId', 'slug'])
export class ModeratorPortal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string;

  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.moderatorPortals)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}
