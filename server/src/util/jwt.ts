import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types';

export function signToken(user: AuthUser): string {
  return jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthUser {
  const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload & AuthUser;
  return { id: decoded.id, role: decoded.role, name: decoded.name, email: decoded.email };
}
