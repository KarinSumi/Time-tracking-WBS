import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: `Access denied. ${roles.join(' or ')} role required.` });
      return;
    }
    next();
  };
};

export const requireSuperAdmin = requireRole(['SUPER_ADMIN']);
export const requireAdmin = requireRole(['ADMIN', 'SUPER_ADMIN']);

export const requireSameOrg = (req: AuthRequest, res: Response, next: NextFunction) => {
  // This is typically handled within services via UserContext
  // But can be used as a guard for org-specific resource IDs if available in params
  next();
};
