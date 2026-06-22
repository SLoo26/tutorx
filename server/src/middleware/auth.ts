import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../util/jwt';
import { Role } from '../types';

/** Reject the request unless a valid Bearer token is present. */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/** Require the authenticated user to hold one of the given roles. */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
