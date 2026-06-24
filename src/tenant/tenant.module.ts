import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModeratorPortalModule } from '../moderator-portal/moderator-portal.module';
import { TenantUser } from '../tenant-user/entities/tenant-user.entity';
import { Tenant } from './entities/tenant.entity';
import { RequirePortalGuard } from './guards/require-portal.guard';
import { RequireTenantGuard } from './guards/require-tenant.guard';
import { TenantContextMiddleware } from './middleware/tenant-context.middleware';
import { TenantService } from './tenant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, TenantUser]),
    ModeratorPortalModule,
  ],
  providers: [
    TenantService,
    TenantContextMiddleware,
    RequireTenantGuard,
    RequirePortalGuard,
  ],
  exports: [
    TenantService,
    RequireTenantGuard,
    RequirePortalGuard,
  ],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
