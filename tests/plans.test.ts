import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { createTestUser, cleanupDatabase } from './setup';

describe('Plans API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  it('should create a plan for admin', async () => {
    const { token, orgId } = await createTestUser('ADMIN');
    const user = await createTestUser('USER', orgId);
    
    const res = await request(app)
      .post('/api/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        assigneeId: user.user.id,
        taskDescription: 'Big Plan',
        plannedHours: 40,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString()
      });

    expect(res.status).toBe(201);
    expect(res.body.taskDescription).toBe('Big Plan');
  });

  it('should reject plan creation for normal user', async () => {
    const { token } = await createTestUser('USER');
    const res = await request(app)
      .post('/api/plans')
      .set('Authorization', `Bearer ${token}`)
      .send({
        assigneeId: 'some-id',
        taskDescription: 'Hacking',
        plannedHours: 10,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString()
      });

    expect(res.status).toBe(403);
  });
});
