import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WebAuthnService } from '@basenative/identity-data-access';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly webauthn = inject(WebAuthnService);
  private readonly router = inject(Router);

  readonly page = {
    title: 'Create Account',
    subtitle: 'Register a passkey to get started',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    displayNameLabel: 'Display name',
    displayNamePlaceholder: 'John Doe',
    registerButton: 'Register Passkey',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign in',
  } as const;

  readonly email = signal('');
  readonly displayName = signal('');
  readonly loading = signal(false);
  readonly error = signal('');

  async register(): Promise<void> {
    const emailValue = this.email();
    const displayNameValue = this.displayName();

    if (!emailValue || !displayNameValue) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.webauthn.register(emailValue, displayNameValue);
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'Registration failed'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
