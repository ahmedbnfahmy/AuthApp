import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { TenantService } from '../tenant/tenant.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tenantService: TenantService,
    private readonly dataSource: DataSource,
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

    const role = 'admin';

    const result = await this.dataSource.transaction(async (manager) => {
      const tenant = await this.tenantService.create(
        { name: dto.tenantName, domainSlug: dto.domainSlug },
        manager,
      );
      const user = await this.userService.create(
        { email: dto.email, password: dto.password },
        manager,
      );
      await this.tenantService.addMember(tenant.id, user.id, role, manager);

      return { user, tenant };
    });

    const access_token = await this.jwtService.signAsync({
      sub: result.user.id,
      email: result.user.email,
      tenant_id: result.tenant.id,
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

  async login(userId: string, email: string, tenantId: string, role: string) {
    const payload = {
      sub: userId,
      email,
      tenant_id: tenantId,
      role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
