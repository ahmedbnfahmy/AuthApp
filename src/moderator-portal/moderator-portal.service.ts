import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ModeratorPortal } from './entities/moderator-portal.entity';

@Injectable()
export class ModeratorPortalService {
  constructor(
    @InjectRepository(ModeratorPortal)
    private readonly portalRepository: Repository<ModeratorPortal>,
  ) {}

  findByTenantAndSlug(
    tenantId: string,
    slug: string,
  ): Promise<ModeratorPortal | null> {
    return this.portalRepository.findOne({
      where: { tenantId, slug, status: 'active' },
    });
  }

  findByTenantId(tenantId: string): Promise<ModeratorPortal[]> {
    return this.portalRepository.find({
      where: { tenantId, status: 'active' },
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    data: { tenantId: string; slug: string },
    manager?: EntityManager,
  ): Promise<ModeratorPortal> {
    const repo = manager
      ? manager.getRepository(ModeratorPortal)
      : this.portalRepository;
    const portal = repo.create(data);
    return repo.save(portal);
  }
}
