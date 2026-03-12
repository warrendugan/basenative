import { StoredCredential } from '@basenative/shared-types';

export function createStoredCredential(params: {
  credentialId: string;
  userId: string;
  publicKey: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports: string[];
}): StoredCredential {
  return {
    ...params,
    createdAt: new Date().toISOString(),
  };
}
