import { Request, Response, NextFunction } from 'express';
import { ExtendedRequest, AuthPayload } from '../types';

const PUBLIC_ROUTES = ['/api/health', '/api/auth/login'];

interface JWTPayload {
  exp?: number;
  [key: string]: unknown;
}

function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function authMiddleware(
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void {
  // Skip auth for public routes
  if (PUBLIC_ROUTES.includes(req.path)) {
    return next();
  }

  const authHeader = req.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const decoded = decodeJWT(token);

  if (!decoded) {
    return next();
  }

  // Check if token is expired
  if (decoded.exp && typeof decoded.exp === 'number') {
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return next();
    }
  }

  // Attach user to request
  req.user = decoded as unknown as AuthPayload;
  next();
}
