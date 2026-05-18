import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'aion-dev-secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  orgId?: string;
}

export function generateToken(userId: string, role: string, orgId: string): string {
  return jwt.sign({ userId, role, orgId }, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token!, JWT_SECRET) as { userId: string; role: string; orgId: string };
    
    if (!decoded.userId || !decoded.orgId) {
      res.status(401).json({ error: 'Invalid token payload' });
      return;
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.orgId = decoded.orgId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
