import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const maintenanceFile = path.join(process.cwd(), '.maintenance');

export function maintenanceMiddleware(req: Request, res: Response, next: NextFunction) {
  if (fs.existsSync(maintenanceFile)) {
    const allowedPaths = [
      '/health',
      '/api/auth/login',
      '/api/auth/me',
      '/api/admin/status'
    ];

    // Check if current path starts with any allowed path prefix
    const isAllowed = allowedPaths.some(p => req.path.startsWith(p));
    if (!isAllowed) {
      res.status(503).json({ error: 'System is currently undergoing maintenance. Please try again shortly.' });
      return;
    }
  }
  next();
}
