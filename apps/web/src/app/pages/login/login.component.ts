import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WebAuthnService } from '@basenative/identity-data-access';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly webauthn = inject(WebAuthnService);
  private readonly router = inject(Router);

  readonly page = {
    title: 'Welcome Back',
    subtitle: 'Sign in with your passkey',
    emailLabel: 'Email address',
    emailPlaceholder: 'you@example.com',
    signInButton: 'Sign in with Passkey',
    noAccount: "Don't have an account?",
    registerLink: 'Register',
  } as const;

  readonly email = signal('');
  readonly loading = signal(false);
  readonly error = signal('');

  async signIn(): Promise<void> {
    const emailValue = this.email();
    if (!emailValue) {
      this.error.set('Please enter your email address');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.webauthn.authenticate(emailValue);
      await this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'Authentication failed'
      );
    } finally {
      this.loading.set(false);
    }
  }
}
