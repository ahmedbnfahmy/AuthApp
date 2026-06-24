export type ParsedHost =
  | { kind: 'platform' }
  | { kind: 'tenant'; tenantSlug: string }
  | { kind: 'portal'; tenantSlug: string; portalSlug: string };

export function parseHost(hostHeader: string, baseDomain: string): ParsedHost {
  const host = hostHeader.split(':')[0].toLowerCase();
  const base = baseDomain.toLowerCase();

  if (host === base || host === 'localhost' || host === '127.0.0.1') {
    return { kind: 'platform' };
  }

  const suffix = `.${base}`;
  if (!host.endsWith(suffix)) {
    return { kind: 'platform' };
  }

  const prefix = host.slice(0, -suffix.length);
  if (!prefix) {
    return { kind: 'platform' };
  }

  const parts = prefix.split('.');
  if (parts.length === 1) {
    return { kind: 'tenant', tenantSlug: parts[0] };
  }
  if (parts.length === 2) {
    return {
      kind: 'portal',
      portalSlug: parts[0],
      tenantSlug: parts[1],
    };
  }

  return { kind: 'platform' };
}

export function parseCustomDomainHost(
  host: string,
  customDomain: string,
): { portalSlug: string | null } | null {
  const normalizedHost = host.split(':')[0].toLowerCase();
  const normalizedDomain = customDomain.toLowerCase();

  if (normalizedHost === normalizedDomain) {
    return { portalSlug: null };
  }

  const suffix = `.${normalizedDomain}`;
  if (normalizedHost.endsWith(suffix)) {
    const portalSlug = normalizedHost.slice(0, -suffix.length);
    if (portalSlug && !portalSlug.includes('.')) {
      return { portalSlug };
    }
  }

  return null;
}

export function buildPortalHost(
  portalSlug: string,
  tenantSlug: string,
  baseDomain: string,
): string {
  return `${portalSlug}.${tenantSlug}.${baseDomain}`;
}
