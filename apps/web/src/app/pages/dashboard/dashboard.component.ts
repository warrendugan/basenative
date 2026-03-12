import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthContext } from '@basenative/shared-auth';
import { WebAuthnService } from '@basenative/identity-data-access';
import type { CredentialListItem } from '@basenative/shared-types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly authContext = inject(AuthContext);
  private readonly webauthn = inject(WebAuthnService);
  private readonly router = inject(Router);

  readonly page = {
    title: 'Dashboard',
    subtitle: 'Your WebAuthn identity',
    claimsHeading: 'Token Claims',
    credentialsHeading: 'Registered Credentials',
    revokeButton: 'Revoke',
    logoutButton: 'Sign out',
    noCredentials: 'No credentials registered',
    columns: {
      credentialId: 'Credential ID',
      deviceType: 'Device Type',
      backedUp: 'Backed Up',
      createdAt: 'Created',
      actions: 'Actions',
    },
  } as const;

  readonly currentUser = this.authContext.currentUser;
  readonly credentials = signal<CredentialListItem[]>([]);
  readonly revoking = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCredentials();
  }

  async loadCredentials(): Promise<void> {
    try {
      const creds = await this.webauthn.getCredentials();
      this.credentials.set(creds);
    } catch {
      // Silently handle - credentials will show as empty
    }
  }

  async revoke(credentialId: string): Promise<void> {
    this.revoking.set(credentialId);
    try {
      await this.webauthn.revokeCredential(credentialId);
      this.credentials.update((creds) =>
        creds.filter((c) => c.credentialId !== credentialId)
      );
    } catch {
      // Revoke failed silently
    } finally {
      this.revoking.set(null);
    }
  }

  logout(): void {
    this.authContext.clearTokens();
    this.router.navigate(['/login']);
  }

  truncateId(id: string): string {
    return id.length > 16 ? id.slice(0, 16) + '...' : id;
  }
}
