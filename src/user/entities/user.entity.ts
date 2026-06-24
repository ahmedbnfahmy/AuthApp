import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TenantUser } from '../../tenant-user/entities/tenant-user.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'boolean', default: false })
  isGlobalAdmin: boolean;

  @OneToMany(() => TenantUser, tenantUser => tenantUser.user)
  tenantUsers: TenantUser[];
}
