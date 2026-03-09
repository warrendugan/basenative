import { Request } from 'express';

export interface AuthPayload {
  sub: string;
  email: string;
  tenantId: string;
  roles: string[];
  displayName: string;
  exp: number;
  iat: number;
}

export interface TenantPayload {
  id: string;
  slug: string;
  name: string;
  plan: 'greenput' | 'scorp-engine';
}

export interface ExtendedRequest extends Request {
  user?: AuthPayload;
  tenant?: TenantPayload;
}
