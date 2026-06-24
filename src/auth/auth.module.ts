import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ModeratorPortalModule } from '../moderator-portal/moderator-portal.module';
import { TenantModule } from '../tenant/tenant.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './guards/roles.guard';
import { PortalRoleGuard, TenantGuard } from './guards/tenant.guard';

@Module({
  imports: [
    UserModule,
    TenantModule,
    ModeratorPortalModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'super-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [AuthService, TenantGuard, PortalRoleGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, TenantGuard, RolesGuard],
})
export class AuthModule {}
