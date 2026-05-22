import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { createTestUser, cleanupDatabase } from './setup';
import prisma from '../src/lib/prisma';
import { loginRateLimiter } from '../src/utils/rateLimiter';

describe('Admin Status API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  it('should block non-admins from fetching system status', async () => {
    const { token } = await createTestUser('USER');

    const res = await request(app)
      .get('/api/admin/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('should allow super admin to fetch system status with metrics', async () => {
    const { token, user } = await createTestUser('SUPER_ADMIN');

    // Create a mock security event log
    await prisma.auditLog.create({
      data: {
        entityType: 'SECURITY',
        entityId: 'INTRUSION',
        action: 'INTRUSION_ALERT',
        performedBy: user.id,
        newValues: { type: 'SQL_INJECTION', path: '/test' }
      }
    });

    const res = await request(app)
      .get('/api/admin/status')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.database.status).toBe('UP');
    expect(res.body.system.uptime).toBeGreaterThan(0);
    expect(res.body.system.memory).toBeDefined();
    expect(res.body.securityEvents.length).toBe(1);
    expect(res.body.securityEvents[0].action).toBe('INTRUSION_ALERT');
  });

  it('should allow admin to unlock a locked email account', async () => {
    const { token } = await createTestUser('SUPER_ADMIN');

    // Record failures to lock an email
    const emailToLock = 'target@blocked.com';
    for (let i = 0; i < 5; i++) {
      loginRateLimiter.recordFailure(emailToLock);
    }
    expect(loginRateLimiter.isLocked(emailToLock).locked).toBe(true);

    // Call unlock route
    const unlockRes = await request(app)
      .post('/api/admin/status/unlock')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: emailToLock });

    expect(unlockRes.status).toBe(200);
    expect(unlockRes.body.success).toBe(true);

    // Verify it is unlocked now
    expect(loginRateLimiter.isLocked(emailToLock).locked).toBe(false);

    // Verify audit log has the manual unlock action
    const logs = await prisma.auditLog.findMany({
      where: { action: 'MANUAL_UNLOCK' }
    });
    expect(logs.length).toBe(1);
    expect(logs[0].entityId).toBe(emailToLock);
  });
});
