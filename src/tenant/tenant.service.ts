import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { TenantRole } from '../common/enums/tenant-role.enum';
import { requiresPortalId } from '../common/utils/role.util';
import { TenantUser } from '../tenant-user/entities/tenant-user.entity';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantUser)
    private readonly tenantUserRepository: Repository<TenantUser>,
  ) {}

  findByDomainSlug(domainSlug: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { domainSlug } });
  }

  findByCustomDomain(customDomain: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { customDomain } });
  }

  findById(id: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({ where: { id } });
  }

  async create(
    data: { name: string; domainSlug: string },
    manager?: EntityManager,
  ): Promise<Tenant> {
    const repo = manager ? manager.getRepository(Tenant) : this.tenantRepository;
    const tenant = repo.create(data);
    return repo.save(tenant);
  }

  findMembership(
    tenantId: string,
    userId: string,
  ): Promise<TenantUser | null> {
    return this.tenantUserRepository.findOne({
      where: { tenantId, userId },
    });
  }

  countMembersByRole(
    tenantId: string,
    role: TenantRole,
    portalId?: string | null,
  ): Promise<number> {
    if (role === TenantRole.Admin) {
      return this.tenantUserRepository
        .createQueryBuilder('tu')
        .where('tu.tenantId = :tenantId', { tenantId })
        .andWhere('tu.role = :role', { role })
        .andWhere('tu.portalId IS NULL')
        .getCount();
    }

    return this.tenantUserRepository.count({
      where: {
        tenantId,
        role,
        ...(portalId !== undefined ? { portalId: portalId ?? undefined } : {}),
      },
    });
  }

  async addMember(
    tenantId: string,
    userId: string,
    role: TenantRole,
    portalId: string | null = null,
    manager?: EntityManager,
  ): Promise<TenantUser> {
    if (requiresPortalId(role) && !portalId) {
      throw new BadRequestException(
        `${role} must be assigned to a moderator portal`,
      );
    }
    if (role === TenantRole.Admin && portalId) {
      throw new BadRequestException('Admin cannot be assigned to a portal');
    }

    const repo = manager
      ? manager.getRepository(TenantUser)
      : this.tenantUserRepository;
    const membership = repo.create({ tenantId, userId, role, portalId });
    return repo.save(membership);
  }

  async updateMemberRole(
    tenantId: string,
    userId: string,
    role: TenantRole,
    portalId: string | null,
  ): Promise<TenantUser> {
    const membership = await this.findMembership(tenantId, userId);
    if (!membership) {
      throw new NotFoundException('Member not found in this tenant');
    }

    if (requiresPortalId(role) && !portalId) {
      throw new BadRequestException(
        `${role} must be assigned to a moderator portal`,
      );
    }
    if (role === TenantRole.Admin && portalId) {
      throw new BadRequestException('Admin cannot be assigned to a portal');
    }

    membership.role = role;
    membership.portalId = portalId;
    return this.tenantUserRepository.save(membership);
  }
}
