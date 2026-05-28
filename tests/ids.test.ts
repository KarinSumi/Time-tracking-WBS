import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { createTestUser, cleanupDatabase } from './setup';
import prisma from '../src/lib/prisma';

describe('Intrusion Detection System Middleware', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  it('should block SQL injection in req.body and log security alert', async () => {
    const { token, user } = await createTestUser();

    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hours: 4,
        taskDescription: "'; DROP TABLE TimeEntry; --",
        date: new Date().toISOString()
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Malicious payload detected');

    // Verify audit log exists
    const logs = await prisma.auditLog.findMany({
      where: { action: 'INTRUSION_ALERT' }
    });
    expect(logs.length).toBe(1);
    expect(logs[0].entityType).toBe('SECURITY');
    expect((logs[0].newValues as any).type).toBe('SQL_INJECTION');
  });

  it('should block path traversal in req.query and log security alert', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .get('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .query({
        file: '../../etc/passwd'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Malicious payload detected');

    const logs = await prisma.auditLog.findMany({
      where: { action: 'INTRUSION_ALERT' }
    });
    expect(logs.length).toBe(1);
    expect((logs[0].newValues as any).type).toBe('PATH_TRAVERSAL');
  });

  it('should allow normal clean requests', async () => {
    const { token } = await createTestUser();

    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hours: 2,
        taskDescription: 'Checking the select box component and normal inputs',
        date: new Date().toISOString()
      });

    expect(res.status).toBe(201);
  });

  it('should block SQL injection for unauthenticated visitors and log it anonymously (performedBy is null)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: "' OR '1'='1",
        password: 'password123'
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Malicious payload detected');

    // Verify audit log has the event with performedBy === null
    const logs = await prisma.auditLog.findMany({
      where: { action: 'INTRUSION_ALERT' }
    });
    expect(logs.length).toBe(1);
    expect(logs[0].performedBy).toBeNull();
  });
});
