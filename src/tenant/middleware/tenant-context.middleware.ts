import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Response } from 'express';
import { RequestWithContext } from '../../common/types/request-context';
import {
  parseCustomDomainHost,
  parseHost,
} from '../../common/utils/tenant-host.util';
import { ModeratorPortalService } from '../../moderator-portal/moderator-portal.service';
import { TenantService } from '../tenant.service';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantService: TenantService,
    private readonly portalService: ModeratorPortalService,
    private readonly configService: ConfigService,
  ) {}

  async use(
    req: RequestWithContext,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const host = req.headers.host ?? '';
    const baseDomain =
      this.configService.get<string>('BASE_DOMAIN') ?? 'localhost';

    const parsed = parseHost(host, baseDomain);

    if (parsed.kind === 'tenant') {
      const tenant = await this.tenantService.findByDomainSlug(parsed.tenantSlug);
      if (tenant) {
        req.tenant = tenant;
        req.portal = null;
      }
      return next();
    }

    if (parsed.kind === 'portal') {
      const tenant = await this.tenantService.findByDomainSlug(parsed.tenantSlug);
      if (tenant) {
        req.tenant = tenant;
        req.portal =
          (await this.portalService.findByTenantAndSlug(
            tenant.id,
            parsed.portalSlug,
          )) ?? null;
      }
      return next();
    }

    const custom = await this.resolveCustomDomain(host);
    if (custom) {
      req.tenant = custom.tenant;
      req.portal = custom.portal;
    }

    next();
  }

  private async resolveCustomDomain(hostHeader: string): Promise<{
    tenant: NonNullable<RequestWithContext['tenant']>;
    portal: RequestWithContext['portal'];
  } | null> {
    const host = hostHeader.split(':')[0].toLowerCase();

    const exactTenant = await this.tenantService.findByCustomDomain(host);
    if (exactTenant) {
      return { tenant: exactTenant, portal: null };
    }

    const parts = host.split('.');
    for (let i = 1; i < parts.length; i++) {
      const domain = parts.slice(i).join('.');
      const tenant = await this.tenantService.findByCustomDomain(domain);
      if (!tenant) {
        continue;
      }

      const parsed = parseCustomDomainHost(host, domain);
      if (!parsed) {
        continue;
      }

      if (!parsed.portalSlug) {
        return { tenant, portal: null };
      }

      const portal = await this.portalService.findByTenantAndSlug(
        tenant.id,
        parsed.portalSlug,
      );
      return { tenant, portal: portal ?? null };
    }

    return null;
  }
}
