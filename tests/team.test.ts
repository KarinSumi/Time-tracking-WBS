import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { cleanupDatabase, createTestUser } from './setup';

describe('Team API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it('should list team members for the organization', async () => {
    const { token, orgId } = await createTestUser('ADMIN');
    await createTestUser('USER', orgId);

    const res = await request(app)
      .get('/api/team')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should allow admin to assign a manager', async () => {
    const { token, user: adminUser } = await createTestUser('ADMIN');
    const { user: normalUser } = await createTestUser('USER', adminUser.orgId);

    const res = await request(app)
      .patch(`/api/team/${normalUser.id}/manager`)
      .set('Authorization', `Bearer ${token}`)
      .send({ managerId: adminUser.id });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('managerId', adminUser.id);
  });

  it('should prevent self-assignment of manager', async () => {
    const { token, user: adminUser } = await createTestUser('ADMIN');

    const res = await request(app)
      .patch(`/api/team/${adminUser.id}/manager`)
      .set('Authorization', `Bearer ${token}`)
      .send({ managerId: adminUser.id });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'A user cannot be their own manager');
  });
});
