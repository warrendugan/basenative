export interface AuthUser {
  id: string;
  email: string;
  tenantId: string;
  roles: readonly string[];
  displayName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  plan: 'greenput' | 'scorp-engine';
}
