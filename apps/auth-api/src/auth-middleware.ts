import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt-service';
import type { AppClaims } from '@basenative/shared-types';

declare global {
  namespace Express {
    interface Request {
      user?: AppClaims;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    req.user = await verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
