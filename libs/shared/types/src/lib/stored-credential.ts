export interface StoredCredential {
  credentialId: string;
  userId: string;
  publicKey: string;
  counter: number;
  deviceType: string;
  backedUp: boolean;
  transports: string[];
  createdAt: string;
}
