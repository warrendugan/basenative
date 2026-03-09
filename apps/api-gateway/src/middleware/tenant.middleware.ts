import { Request, Response, NextFunction } from 'express';
import { ExtendedRequest, TenantPayload } from '../types';

const ORIGIN_TO_TENANT_MAP: Record<string, string> = {
  'localhost:4300': 'greenput',
};

const TENANT_CONFIG: Record<
  string,
  Omit<TenantPayload, 'id'>
> = {
  greenput: {
    slug: 'greenput',
    name: 'GreenPut',
    plan: 'greenput',
  },
};

export function tenantMiddleware(
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void {
  // Try to get tenant from header first
  let tenantId = req.get('X-Tenant-ID');

  // If not in header, try to derive from origin
  if (!tenantId) {
    const origin = req.get('Origin') || req.get('Referer');
    if (origin) {
      const url = new URL(origin);
      const host = url.host;
      tenantId = ORIGIN_TO_TENANT_MAP[host];
    }
  }

  // Default to greenput if not found
  if (!tenantId) {
    tenantId = 'greenput';
  }

  // Resolve tenant configuration
  const tenantConfig = TENANT_CONFIG[tenantId];
  if (tenantConfig) {
    req.tenant = {
      id: tenantId,
      ...tenantConfig,
    };
  }

  next();
}
