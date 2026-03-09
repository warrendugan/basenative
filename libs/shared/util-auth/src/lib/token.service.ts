import { Injectable, signal, computed } from '@angular/core';
import { AuthUser, AuthTokens, TenantContext } from './auth.models';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly tokens = signal<AuthTokens | null>(null);

  readonly currentUser = signal<AuthUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly tenant = signal<TenantContext | null>(null);

  setTokens(tokens: AuthTokens): void {
    this.tokens.set(tokens);
  }

  clearTokens(): void {
    this.tokens.set(null);
    this.currentUser.set(null);
    this.tenant.set(null);
  }

  getAccessToken(): string | null {
    return this.tokens()?.accessToken ?? null;
  }

  setCurrentUser(user: AuthUser): void {
    this.currentUser.set(user);
  }

  setTenant(tenant: TenantContext): void {
    this.tenant.set(tenant);
  }
}
