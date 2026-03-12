import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { AuthContext } from '@basenative/shared-auth';
import type {
  RegisterStartResponse,
  RegisterFinishResponse,
  AuthenticateStartResponse,
  AuthenticateFinishResponse,
  CredentialListItem,
} from '@basenative/shared-types';

const API_BASE = 'http://localhost:3333/auth';

@Injectable({ providedIn: 'root' })
export class WebAuthnService {
  private readonly http = inject(HttpClient);
  private readonly authContext = inject(AuthContext);

  async register(email: string, displayName: string): Promise<void> {
    // Step 1: Get registration options
    const startRes = await firstValueFrom(
      this.http.post<RegisterStartResponse>(`${API_BASE}/register/start`, {
        email,
        displayName,
      })
    );

    // Step 2: Browser ceremony
    const attestation = await startRegistration({ optionsJSON: startRes.options });

    // Step 3: Verify with server
    const finishRes = await firstValueFrom(
      this.http.post<RegisterFinishResponse>(`${API_BASE}/register/finish`, {
        userId: startRes.userId,
        email,
        displayName,
        response: attestation,
      })
    );

    this.authContext.setTokens(finishRes.accessToken, finishRes.refreshToken);
  }

  async authenticate(email: string): Promise<void> {
    // Step 1: Get authentication options
    const startRes = await firstValueFrom(
      this.http.post<AuthenticateStartResponse>(
        `${API_BASE}/authenticate/start`,
        { email }
      )
    );

    // Step 2: Browser ceremony
    const assertion = await startAuthentication({ optionsJSON: startRes.options });

    // Step 3: Verify with server
    const finishRes = await firstValueFrom(
      this.http.post<AuthenticateFinishResponse>(
        `${API_BASE}/authenticate/finish`,
        {
          email,
          response: assertion,
        }
      )
    );

    this.authContext.setTokens(finishRes.accessToken, finishRes.refreshToken);
  }

  async getCredentials(): Promise<CredentialListItem[]> {
    return firstValueFrom(
      this.http.get<CredentialListItem[]>(`${API_BASE}/credentials`)
    );
  }

  async revokeCredential(credentialId: string): Promise<void> {
    await firstValueFrom(
      this.http.post(`${API_BASE}/credentials/revoke`, { credentialId })
    );
  }
}
