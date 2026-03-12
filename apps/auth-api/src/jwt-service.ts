import { generateKeyPair, exportJWK, importJWK, SignJWT, jwtVerify, JWK } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import type { AppClaims } from '@basenative/shared-types';

let privateKey: CryptoKey;
let publicKey: CryptoKey;
let publicJwk: JWK;
let kid: string;

export async function initKeys(): Promise<void> {
  const pair = await generateKeyPair('RS256');
  privateKey = pair.privateKey;
  publicKey = pair.publicKey;
  publicJwk = await exportJWK(publicKey);
  kid = uuidv4();
  publicJwk.kid = kid;
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';
}

export function getJwks(): { keys: JWK[] } {
  return { keys: [publicJwk] };
}

export async function signAccessToken(claims: {
  sub: string;
  email: string;
  roles: string[];
  tenantId: string;
}): Promise<string> {
  return new SignJWT({
    email: claims.email,
    roles: claims.roles,
    tenantId: claims.tenantId,
  } as Record<string, unknown>)
    .setProtectedHeader({ alg: 'RS256', kid })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime('15m')
    .setJti(uuidv4())
    .sign(privateKey);
}

export async function signRefreshToken(sub: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'RS256', kid })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime('7d')
    .setJti(uuidv4())
    .sign(privateKey);
}

export async function verifyToken(token: string): Promise<AppClaims> {
  const jwk = await importJWK(publicJwk, 'RS256');
  const { payload } = await jwtVerify(token, jwk);
  return payload as unknown as AppClaims;
}
