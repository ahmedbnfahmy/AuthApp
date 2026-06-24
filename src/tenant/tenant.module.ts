import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantUser } from '../tenant-user/entities/tenant-user.entity';
import { Tenant } from './entities/tenant.entity';
import { TenantService } from './tenant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantUser])],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
