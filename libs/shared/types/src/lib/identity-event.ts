export type IdentityEvent =
  | { type: 'UserRegistered'; userId: string; email: string; tenantId: string }
  | { type: 'UserLoggedIn'; userId: string; credentialId: string; at: Date }
  | { type: 'CredentialRevoked'; userId: string; credentialId: string };
