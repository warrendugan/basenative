import { Router, Response } from 'express';
import { ExtendedRequest, AuthPayload } from '../types';

const router = Router();

const JWT_SECRET = process.env['JWT_SECRET'] || 'dev-secret-key-change-in-production';

interface LoginRequest {
  email?: string;
  password?: string;
}

function generateMockJWT(user: AuthPayload): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      iat: now,
      exp: now + 3600, // 1 hour
    })
  ).toString('base64');

  // Simplified signature (not cryptographically secure, for demo only)
  const signature = Buffer.from(JWT_SECRET).toString('base64');

  return `${header}.${payload}.${signature}`;
}

router.post('/login', (req: ExtendedRequest, res: Response) => {
  const body = req.body as LoginRequest;
  const email = body.email || 'user@example.com';

  // Mock user based on tenant
  const tenantId = req.tenant?.id || 'greenput';
  const mockUser: AuthPayload = {
    sub: 'user-1',
    email,
    tenantId,
    roles: ['admin'],
    displayName: 'Test User',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
  };

  const accessToken = generateMockJWT(mockUser);
  const refreshToken = Buffer.from(JSON.stringify({ userId: 'user-1' })).toString('base64');

  res.json({
    accessToken,
    refreshToken,
    expiresAt: mockUser.exp,
    user: {
      id: mockUser.sub,
      email: mockUser.email,
      tenantId: mockUser.tenantId,
      roles: mockUser.roles,
      displayName: mockUser.displayName,
    },
  });
});

router.post('/refresh', (req: ExtendedRequest, res: Response) => {
  const body = req.body as { refreshToken?: string };
  const refreshToken = body.refreshToken;

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token required' });
    return;
  }

  // Mock new tokens
  const now = Math.floor(Date.now() / 1000);
  const mockUser: AuthPayload = {
    sub: 'user-1',
    email: 'user@example.com',
    tenantId: req.tenant?.id || 'greenput',
    roles: ['admin'],
    displayName: 'Test User',
    exp: now + 3600,
    iat: now,
  };

  const accessToken = generateMockJWT(mockUser);

  res.json({
    accessToken,
    refreshToken: Buffer.from(JSON.stringify({ userId: 'user-1', iat: now })).toString('base64'),
    expiresAt: mockUser.exp,
  });
});

router.get('/me', (req: ExtendedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  res.json({
    id: req.user.sub,
    email: req.user.email,
    tenantId: req.user.tenantId,
    roles: req.user.roles,
    displayName: req.user.displayName,
  });
});

export default router;
