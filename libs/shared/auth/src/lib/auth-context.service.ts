import { Injectable, signal, computed } from '@angular/core';
import type { AppClaims } from '@basenative/shared-types';
import { decodeJwt, isTokenExpired } from './jwt-decode';

const ACCESS_TOKEN_KEY = 'webauthn_access_token';
const REFRESH_TOKEN_KEY = 'webauthn_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthContext {
  private readonly tokenSignal = signal<string | null>(this.loadToken());
  private readonly claimsSignal = signal<AppClaims | null>(this.loadClaims());

  readonly token = this.tokenSignal.asReadonly();
  readonly currentUser = this.claimsSignal.asReadonly();
  readonly isAuthenticated = computed(() => {
    const claims = this.claimsSignal();
    return claims !== null && !isTokenExpired(claims, 0);
  });

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    this.tokenSignal.set(accessToken);
    this.claimsSignal.set(decodeJwt(accessToken));
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.tokenSignal.set(null);
    this.claimsSignal.set(null);
  }

  needsRefresh(): boolean {
    const claims = this.claimsSignal();
    if (!claims) return false;
    return isTokenExpired(claims, 60);
  }

  private loadToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private loadClaims(): AppClaims | null {
    const token = this.loadToken();
    if (!token) return null;
    try {
      const claims = decodeJwt(token);
      if (isTokenExpired(claims, 0)) {
        return null;
      }
      return claims;
    } catch {
      return null;
    }
  }
}
