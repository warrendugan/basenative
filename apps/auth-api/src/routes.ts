import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { challengeStore } from './challenge-store';
import { userRepository } from './user-repository';
import { signAccessToken, signRefreshToken, getJwks } from './jwt-service';
import { requireAuth } from './auth-middleware';
import { createStoredCredential } from '@basenative/identity-domain';
import { eventBus } from '@basenative/identity-domain';
import { isoBase64URL } from '@simplewebauthn/server/helpers';

const RP_NAME = 'WebAuthn POC';
const RP_ID = process.env['RP_ID'] || 'localhost';
const ORIGIN = process.env['ORIGIN'] || 'http://localhost:4200';
const DEFAULT_TENANT = 'default';

export const authRouter = Router();

// ──────────────────────────── Registration ────────────────────────────

authRouter.post('/register/start', async (req: Request, res: Response) => {
  try {
    const { email, displayName } = req.body as {
      email: string;
      displayName: string;
    };

    if (!email || !displayName) {
      res.status(400).json({ error: 'email and displayName are required' });
      return;
    }

    const existingUser = userRepository.findUserByEmail(email);
    const userId = existingUser?.id || uuidv4();

    const existingCredentials = existingUser
      ? userRepository.getCredentialsByUserId(existingUser.id)
      : [];

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: isoBase64URL.toBuffer(userId),
      userName: email,
      userDisplayName: displayName,
      attestationType: 'none',
      excludeCredentials: existingCredentials.map((c) => ({
        id: c.credentialId,
        transports: c.transports as AuthenticatorTransportFuture[],
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    challengeStore.set(`reg:${userId}`, options.challenge);

    res.json({ options, userId });
  } catch (err) {
    console.error('register/start error:', err);
    res.status(500).json({ error: 'Registration start failed' });
  }
});

authRouter.post('/register/finish', async (req: Request, res: Response) => {
  try {
    const { userId, email, displayName, response } = req.body as {
      userId: string;
      email: string;
      displayName: string;
      response: Parameters<typeof verifyRegistrationResponse>[0]['response'];
    };

    const expectedChallenge = challengeStore.get(`reg:${userId}`);
    if (!expectedChallenge) {
      res.status(400).json({ error: 'Challenge expired or not found' });
      return;
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      res.status(400).json({ error: 'Verification failed' });
      return;
    }

    challengeStore.delete(`reg:${userId}`);

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    // Upsert user
    const existingUser = userRepository.findUserByEmail(email);
    if (!existingUser) {
      userRepository.createUser({
        id: userId,
        email,
        displayName,
        tenantId: DEFAULT_TENANT,
      });
      eventBus.publish({
        type: 'UserRegistered',
        userId,
        email,
        tenantId: DEFAULT_TENANT,
      });
    }

    const storedCredential = createStoredCredential({
      credentialId: credential.id,
      userId: existingUser?.id || userId,
      publicKey: isoBase64URL.fromBuffer(credential.publicKey),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: (credential.transports || []) as string[],
    });

    userRepository.saveCredential(storedCredential);

    const actualUserId = existingUser?.id || userId;
    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({
        sub: actualUserId,
        email,
        roles: ['user'],
        tenantId: DEFAULT_TENANT,
      }),
      signRefreshToken(actualUserId),
    ]);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('register/finish error:', err);
    res.status(500).json({ error: 'Registration finish failed' });
  }
});

// ──────────────────────────── Authentication ────────────────────────────

authRouter.post('/authenticate/start', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email: string };

    if (!email) {
      res.status(400).json({ error: 'email is required' });
      return;
    }

    const user = userRepository.findUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const credentials = userRepository.getCredentialsByUserId(user.id);

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: credentials.map((c) => ({
        id: c.credentialId,
        transports: c.transports as AuthenticatorTransportFuture[],
      })),
      userVerification: 'preferred',
    });

    challengeStore.set(`auth:${user.id}`, options.challenge);

    res.json({ options });
  } catch (err) {
    console.error('authenticate/start error:', err);
    res.status(500).json({ error: 'Authentication start failed' });
  }
});

authRouter.post('/authenticate/finish', async (req: Request, res: Response) => {
  try {
    const { email, response } = req.body as {
      email: string;
      response: Parameters<typeof verifyAuthenticationResponse>[0]['response'];
    };

    const user = userRepository.findUserByEmail(email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const expectedChallenge = challengeStore.get(`auth:${user.id}`);
    if (!expectedChallenge) {
      res.status(400).json({ error: 'Challenge expired or not found' });
      return;
    }

    const credential = userRepository.getCredentialById(response.id);
    if (!credential) {
      res.status(400).json({ error: 'Credential not found' });
      return;
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: credential.credentialId,
        publicKey: isoBase64URL.toBuffer(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports as AuthenticatorTransportFuture[],
      },
    });

    if (!verification.verified) {
      res.status(400).json({ error: 'Authentication failed' });
      return;
    }

    challengeStore.delete(`auth:${user.id}`);
    userRepository.updateCredentialCounter(
      credential.credentialId,
      verification.authenticationInfo.newCounter
    );

    eventBus.publish({
      type: 'UserLoggedIn',
      userId: user.id,
      credentialId: credential.credentialId,
      at: new Date(),
    });

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({
        sub: user.id,
        email: user.email,
        roles: ['user'],
        tenantId: user.tenant_id,
      }),
      signRefreshToken(user.id),
    ]);

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error('authenticate/finish error:', err);
    res.status(500).json({ error: 'Authentication finish failed' });
  }
});

// ──────────────────────────── JWKS ────────────────────────────

authRouter.get('/.well-known/jwks', (_req: Request, res: Response) => {
  res.json(getJwks());
});

// ──────────────────────────── Credential management ────────────────────────────

authRouter.get('/credentials', requireAuth, (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const credentials = userRepository.getCredentialsByUserId(userId);
  res.json(
    credentials.map((c) => ({
      credentialId: c.credentialId,
      deviceType: c.deviceType,
      backedUp: c.backedUp,
      createdAt: c.createdAt,
      transports: c.transports,
    }))
  );
});

authRouter.post(
  '/credentials/revoke',
  requireAuth,
  (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { credentialId } = req.body as { credentialId: string };

    if (!credentialId) {
      res.status(400).json({ error: 'credentialId is required' });
      return;
    }

    const credential = userRepository.getCredentialById(credentialId);
    if (!credential || credential.userId !== userId) {
      res.status(404).json({ error: 'Credential not found' });
      return;
    }

    userRepository.deleteCredential(credentialId);

    eventBus.publish({
      type: 'CredentialRevoked',
      userId,
      credentialId,
    });

    res.json({ success: true });
  }
);
