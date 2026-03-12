import { getDb } from './database';
import type { StoredCredential } from '@basenative/shared-types';

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  tenant_id: string;
  created_at: string;
}

interface CredentialRow {
  credential_id: string;
  user_id: string;
  public_key: string;
  counter: number;
  device_type: string;
  backed_up: number;
  transports: string;
  created_at: string;
}

export const userRepository = {
  createUser(params: {
    id: string;
    email: string;
    displayName: string;
    tenantId: string;
  }): void {
    const db = getDb();
    db.prepare(
      'INSERT INTO users (id, email, display_name, tenant_id) VALUES (?, ?, ?, ?)'
    ).run(params.id, params.email, params.displayName, params.tenantId);
  },

  findUserByEmail(email: string): UserRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
      | UserRow
      | undefined;
  },

  findUserById(id: string): UserRow | undefined {
    const db = getDb();
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as
      | UserRow
      | undefined;
  },

  saveCredential(cred: StoredCredential): void {
    const db = getDb();
    db.prepare(
      `INSERT INTO credentials (credential_id, user_id, public_key, counter, device_type, backed_up, transports, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      cred.credentialId,
      cred.userId,
      cred.publicKey,
      cred.counter,
      cred.deviceType,
      cred.backedUp ? 1 : 0,
      JSON.stringify(cred.transports),
      cred.createdAt
    );
  },

  getCredentialsByUserId(userId: string): StoredCredential[] {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM credentials WHERE user_id = ?')
      .all(userId) as CredentialRow[];
    return rows.map(rowToCredential);
  },

  getCredentialById(credentialId: string): StoredCredential | undefined {
    const db = getDb();
    const row = db
      .prepare('SELECT * FROM credentials WHERE credential_id = ?')
      .get(credentialId) as CredentialRow | undefined;
    return row ? rowToCredential(row) : undefined;
  },

  updateCredentialCounter(credentialId: string, newCounter: number): void {
    const db = getDb();
    db.prepare('UPDATE credentials SET counter = ? WHERE credential_id = ?').run(
      newCounter,
      credentialId
    );
  },

  deleteCredential(credentialId: string): void {
    const db = getDb();
    db.prepare('DELETE FROM credentials WHERE credential_id = ?').run(credentialId);
  },
};

function rowToCredential(row: CredentialRow): StoredCredential {
  return {
    credentialId: row.credential_id,
    userId: row.user_id,
    publicKey: row.public_key,
    counter: row.counter,
    deviceType: row.device_type,
    backedUp: row.backed_up === 1,
    transports: JSON.parse(row.transports) as string[],
    createdAt: row.created_at,
  };
}
