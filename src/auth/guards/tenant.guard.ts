import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TenantRole } from '../../common/enums/tenant-role.enum';
import {
  JwtPayload,
  RequestWithContext,
} from '../../common/types/request-context';
import { isRoleAllowedOnHost } from '../../common/utils/role.util';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET ?? 'super-secret-key',
      });

      if (request.tenant && payload.tenant_id !== request.tenant.id) {
        throw new ForbiddenException('Token tenant does not match host');
      }

      const hostPortalId = request.portal?.id ?? null;
      const tokenPortalId = payload.portal_id ?? null;
      const isAdminCrossPortal =
        payload.role === TenantRole.Admin &&
        tokenPortalId === null &&
        request.tenant &&
        hostPortalId !== null;

      if (hostPortalId !== tokenPortalId && !isAdminCrossPortal) {
        throw new ForbiddenException('Token portal does not match host');
      }

      request.user = payload;
      request.tenantId = payload.tenant_id;
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(
    request: RequestWithContext,
  ): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class PortalRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    const role = request.user?.role;
    if (!role) {
      throw new ForbiddenException('Missing role in token');
    }

    const hostType = request.portal ? 'portal' : 'tenant';
    if (!isRoleAllowedOnHost(role as TenantRole, hostType)) {
      throw new ForbiddenException('Role not allowed on this host');
    }
    return true;
  }
}
