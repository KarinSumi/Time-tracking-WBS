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
});
