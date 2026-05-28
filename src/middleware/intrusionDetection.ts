import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

const SQLI_PATTERNS = [
  /UNION\s+(ALL\s+)?SELECT/i,
  /\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?/i,
  /;\s*(DROP|DELETE|UPDATE|INSERT|SELECT|TRUNCATE|ALTER)\b/i,
  /['"]\s*--/
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /\/etc\/passwd/i,
  /win\.ini/i,
  /boot\.ini/i
];

function detectPattern(input: string): { detected: boolean; type: string } {
  for (const pattern of SQLI_PATTERNS) {
    if (pattern.test(input)) {
      return { detected: true, type: 'SQL_INJECTION' };
    }
  }
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(input)) {
      return { detected: true, type: 'PATH_TRAVERSAL' };
    }
  }
  return { detected: false, type: '' };
}

function checkObject(obj: any): { detected: boolean; type: string; value: string } | null {
  if (!obj) return null;
  if (typeof obj === 'string') {
    const res = detectPattern(obj);
    if (res.detected) return { ...res, value: obj };
  } else if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const res = checkObject(obj[key]);
        if (res) return res;
      }
    }
  }
  return null;
}

export const intrusionDetection = async (req: Request & { userId?: string }, res: Response, next: NextFunction) => {
  const checks = [
    { name: 'url', val: req.originalUrl || req.url },
    { name: 'query', val: req.query },
    { name: 'params', val: req.params },
    { name: 'body', val: req.body }
  ];

  for (const check of checks) {
    const result = checkObject(check.val);
    if (result) {
      let performedBy = req.userId || null;

      try {
        await prisma.auditLog.create({
          data: {
            entityType: 'SECURITY',
            entityId: 'INTRUSION',
            action: 'INTRUSION_ALERT',
            performedBy,
            newValues: {
              type: result.type,
              location: check.name,
              offendingValue: result.value,
              path: req.path,
              ip: req.ip || req.socket.remoteAddress
            }
          }
        });
      } catch (e) {
        console.error('Failed to create intrusion alert audit log:', e);
      }

      res.status(400).json({ error: 'Malicious payload detected' });
      return;
    }
  }

  next();
};
