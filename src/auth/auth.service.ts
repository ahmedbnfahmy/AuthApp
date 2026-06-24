import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { TenantRole } from '../common/enums/tenant-role.enum';
import {
  canAssignRole,
  isRoleAllowedOnHost,
  requiresPortalId,
} from '../common/utils/role.util';
import { buildPortalHost } from '../common/utils/tenant-host.util';
import { ModeratorPortal } from '../moderator-portal/entities/moderator-portal.entity';
import { ModeratorPortalService } from '../moderator-portal/moderator-portal.service';
import { Tenant } from '../tenant/entities/tenant.entity';
import { TenantService } from '../tenant/tenant.service';
import { UserService } from '../user/user.service';
import {
  AddMemberDto,
  CreatePortalDto,
  LoginDto,
  UpdateMemberRoleDto,
} from './dto/auth.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly portalService: ModeratorPortalService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const existingTenant = await this.tenantService.findByDomainSlug(
      dto.domainSlug,
    );
    if (existingTenant) {
      throw new ConflictException('Workspace slug is already taken');
    }

    const role = TenantRole.Admin;

    const result = await this.dataSource.transaction(async (manager) => {
      const tenant = await this.tenantService.create(
        { name: dto.tenantName, domainSlug: dto.domainSlug },
        manager,
      );
      const user = await this.userService.create(
        { email: dto.email, password: dto.password },
        manager,
      );
      await this.tenantService.addMember(
        tenant.id,
        user.id,
        role,
        null,
        manager,
      );

      return { user, tenant };
    });

    const access_token = await this.signToken({
      userId: result.user.id,
      email: result.user.email,
      tenantId: result.tenant.id,
      portalId: null,
      role,
    });

    return {
      access_token,
      user: {
        id: result.user.id,
        email: result.user.email,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        domainSlug: result.tenant.domainSlug,
      },
      role,
    };
  }

  async login(dto: LoginDto, tenant: Tenant, portal: ModeratorPortal | null) {
    const hostType = portal ? 'portal' : 'tenant';

    const user = await this.userService.findByEmail(dto.email);
    if (!user || !(await this.userService.verifyPassword(user, dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const membership = await this.tenantService.findMembership(tenant.id, user.id);
    if (!membership) {
      throw new UnauthorizedException('Not a member of this tenant');
    }

    if (!isRoleAllowedOnHost(membership.role, hostType)) {
      throw new ForbiddenException('Role not allowed on this host');
    }

    const expectedPortalId = portal?.id ?? null;
    const memberPortalId = membership.portalId ?? null;
    if (expectedPortalId !== memberPortalId) {
      throw new ForbiddenException('Member portal does not match host');
    }

    const access_token = await this.signToken({
      userId: user.id,
      email: user.email,
      tenantId: tenant.id,
      portalId: memberPortalId,
      role: membership.role,
    });

    return {
      access_token,
      user: { id: user.id, email: user.email },
      tenant: {
        id: tenant.id,
        name: tenant.name,
        domainSlug: tenant.domainSlug,
      },
      portal: portal
        ? { id: portal.id, slug: portal.slug, host: this.portalHost(portal, tenant) }
        : null,
      role: membership.role,
    };
  }

  async createPortal(dto: CreatePortalDto, tenant: Tenant) {
    const existing = await this.portalService.findByTenantAndSlug(
      tenant.id,
      dto.slug,
    );
    if (existing) {
      throw new ConflictException('Portal slug is already taken for this tenant');
    }

    const moderatorUser = await this.userService.findByEmail(dto.moderatorEmail);

    const result = await this.dataSource.transaction(async (manager) => {
      const portal = await this.portalService.create(
        { tenantId: tenant.id, slug: dto.slug },
        manager,
      );

      let user = moderatorUser;
      if (!user) {
        user = await this.userService.create(
          {
            email: dto.moderatorEmail,
            password: dto.moderatorPassword,
          },
          manager,
        );
      } else {
        const existingMembership = await this.tenantService.findMembership(
          tenant.id,
          user.id,
        );
        if (existingMembership) {
          throw new ConflictException(
            'Moderator email is already a member of this tenant',
          );
        }
      }

      await this.tenantService.addMember(
        tenant.id,
        user.id,
        TenantRole.Moderator,
        portal.id,
        manager,
      );

      return { portal, user };
    });

    return {
      portal: {
        id: result.portal.id,
        slug: result.portal.slug,
        host: this.portalHost(result.portal, tenant),
      },
      moderator: {
        id: result.user.id,
        email: result.user.email,
      },
    };
  }

  async listPortals(tenant: Tenant) {
    const portals = await this.portalService.findByTenantId(tenant.id);
    return portals.map((portal) => ({
      id: portal.id,
      slug: portal.slug,
      host: this.portalHost(portal, tenant),
      status: portal.status,
      createdAt: portal.createdAt,
    }));
  }

  async addMember(
    dto: AddMemberDto,
    actorRole: TenantRole,
    tenant: Tenant,
    portal: ModeratorPortal | null,
  ) {
    if (!canAssignRole(actorRole, dto.role)) {
      throw new ForbiddenException('Cannot assign this role');
    }

    if (portal) {
      if (
        dto.role !== TenantRole.Cashier &&
        dto.role !== TenantRole.Customer &&
        actorRole === TenantRole.Moderator
      ) {
        throw new ForbiddenException('Moderator can only add cashiers and customers');
      }
    } else if (dto.role !== TenantRole.Admin) {
      throw new BadRequestException(
        'Only admin members can be added on the tenant root host',
      );
    }

    const portalId = requiresPortalId(dto.role) ? portal?.id ?? null : null;
    if (requiresPortalId(dto.role) && !portalId) {
      throw new BadRequestException(
        'Cashiers and customers must be added on a moderator portal host',
      );
    }

    const existingUser = await this.userService.findByEmail(dto.email);
    const existingMembership =
      existingUser &&
      (await this.tenantService.findMembership(tenant.id, existingUser.id));

    if (existingMembership) {
      throw new ConflictException('User is already a member of this tenant');
    }

    if (!existingUser && !dto.password) {
      throw new BadRequestException('Password is required for new users');
    }

    const user =
      existingUser ??
      (await this.userService.create({
        email: dto.email,
        password: dto.password!,
      }));

    const membership = await this.tenantService.addMember(
      tenant.id,
      user.id,
      dto.role,
      portalId,
    );

    return {
      userId: user.id,
      email: user.email,
      role: membership.role,
      portalId: membership.portalId,
    };
  }

  async updateMemberRole(
    userId: string,
    dto: UpdateMemberRoleDto,
    actorRole: TenantRole,
    tenant: Tenant,
    portal: ModeratorPortal | null,
  ) {
    if (!canAssignRole(actorRole, dto.role)) {
      throw new ForbiddenException('Cannot assign this role');
    }

    const membership = await this.tenantService.findMembership(tenant.id, userId);
    if (!membership) {
      throw new BadRequestException('Member not found');
    }

    if (portal && membership.portalId !== portal.id) {
      throw new ForbiddenException('Member does not belong to this portal');
    }
    if (!portal && membership.portalId) {
      throw new ForbiddenException('Portal members must be updated on portal host');
    }

    if (
      membership.role === TenantRole.Admin &&
      dto.role !== TenantRole.Admin
    ) {
      const adminCount = await this.tenantService.countMembersByRole(
        tenant.id,
        TenantRole.Admin,
      );
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the last admin');
      }
    }

    const portalId = requiresPortalId(dto.role)
      ? portal?.id ?? membership.portalId
      : null;

    if (requiresPortalId(dto.role) && !portalId) {
      throw new BadRequestException(
        'Moderator, cashier, and customer roles require a portal',
      );
    }

    const updated = await this.tenantService.updateMemberRole(
      tenant.id,
      userId,
      dto.role,
      portalId,
    );

    return {
      userId,
      role: updated.role,
      portalId: updated.portalId,
    };
  }

  private async signToken(data: {
    userId: string;
    email: string;
    tenantId: string;
    portalId: string | null;
    role: TenantRole;
  }) {
    return this.jwtService.signAsync({
      sub: data.userId,
      email: data.email,
      tenant_id: data.tenantId,
      portal_id: data.portalId,
      role: data.role,
    });
  }

  private portalHost(portal: ModeratorPortal, tenant: Tenant): string {
    const baseDomain =
      this.configService.get<string>('BASE_DOMAIN') ?? 'localhost';
    return buildPortalHost(portal.slug, tenant.domainSlug, baseDomain);
  }
}
