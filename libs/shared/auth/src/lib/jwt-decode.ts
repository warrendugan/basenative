import type { AppClaims } from '@basenative/shared-types';

export function decodeJwt(token: string): AppClaims {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded) as AppClaims;
}

export function isTokenExpired(claims: AppClaims, bufferSeconds = 60): boolean {
  const now = Math.floor(Date.now() / 1000);
  return claims.exp - bufferSeconds <= now;
}
