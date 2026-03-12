export interface AppClaims {
  sub: string;
  email: string;
  roles: string[];
  tenantId: string;
  iat: number;
  exp: number;
  jti: string;
}
