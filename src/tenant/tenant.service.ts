import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
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

  async create(
    data: { name: string; domainSlug: string },
    manager?: EntityManager,
  ): Promise<Tenant> {
    const repo = manager ? manager.getRepository(Tenant) : this.tenantRepository;
    const tenant = repo.create(data);

    return repo.save(tenant);
  }

  async addMember(
    tenantId: string,
    userId: string,
    role: string,
    manager?: EntityManager,
  ): Promise<TenantUser> {
    const repo = manager
      ? manager.getRepository(TenantUser)
      : this.tenantUserRepository;
    const membership = repo.create({ tenantId, userId, role });

    return repo.save(membership);
  }
}
