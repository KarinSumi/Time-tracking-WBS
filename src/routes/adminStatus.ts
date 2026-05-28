import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import prisma from '../lib/prisma';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { loginRateLimiter } from '../utils/rateLimiter';

const router = express.Router();

// Only allow SUPER_ADMIN or ADMIN to check system status
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'SUPER_ADMIN' && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Access forbidden: Administrator privilege required' });
      return;
    }

    let dbStatus = 'UP';
    let dbLatencyMs = 0;
    try {
      const start = Date.now();
      // Simple raw query to check database connection
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
    } catch (e) {
      dbStatus = 'DOWN';
    }

    const uptime = process.uptime();
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();

    const lockouts = loginRateLimiter.getActiveLockouts();

    const securityEvents = await prisma.auditLog.findMany({
      where: {
        entityType: 'SECURITY'
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 20
    });

    res.json({
      status: dbStatus === 'UP' ? 'healthy' : 'unhealthy',
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs
      },
      system: {
        uptime,
        memory,
        cpu
      },
      lockouts,
      securityEvents
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch system metrics' });
  }
});

// Endpoint to manually unlock locked accounts
router.post('/unlock', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'SUPER_ADMIN' && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Access forbidden: Administrator privilege required' });
      return;
    }

    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email parameter is required' });
      return;
    }

    loginRateLimiter.reset(email);

    await prisma.auditLog.create({
      data: {
        entityType: 'SECURITY',
        entityId: email,
        action: 'MANUAL_UNLOCK',
        performedBy: req.userId!,
        newValues: { email, reason: 'Manually unlocked by administrator' }
      }
    });

    res.json({ success: true, message: `Account ${email} has been unlocked.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to unlock account' });
  }
});

router.post('/upgrade', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== 'SUPER_ADMIN' && req.userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Access forbidden: Administrator privilege required' });
      return;
    }

    const maintFile = path.join(process.cwd(), '.maintenance');
    fs.writeFileSync(maintFile, 'true');

    const scriptPath = path.join(process.cwd(), 'scripts/redeploy.sh');
    const child = spawn('bash', [scriptPath], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    res.json({ success: true, message: 'System upgrade initiated. Entering maintenance mode.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to trigger system upgrade' });
  }
});

export default router;
