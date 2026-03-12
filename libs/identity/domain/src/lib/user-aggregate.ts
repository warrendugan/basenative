import { StoredCredential } from '@basenative/shared-types';

export interface User {
  id: string;
  email: string;
  displayName: string;
  tenantId: string;
  createdAt: string;
}

export interface UserWithCredentials extends User {
  credentials: StoredCredential[];
}

export function createUser(params: {
  id: string;
  email: string;
  displayName: string;
  tenantId: string;
}): User {
  return {
    ...params,
    createdAt: new Date().toISOString(),
  };
}

export function addCredentialToUser(
  user: User,
  credential: StoredCredential
): UserWithCredentials {
  return {
    ...user,
    credentials: [credential],
  };
}
