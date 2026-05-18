import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { createTestUser, cleanupDatabase } from './setup';

describe('Projects API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  it('should create a project for admin', async () => {
    const { token } = await createTestUser('ADMIN');
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Project' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Project');
  });

  it('should enforce tenant isolation for projects', async () => {
    const org1 = await createTestUser('ADMIN');
    const org2 = await createTestUser('ADMIN');

    const p1 = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${org1.token}`)
      .send({ name: 'Org 1 Project' });

    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${org2.token}`);

    expect(res.status).toBe(200);
    const names = res.body.map((p: any) => p.name);
    expect(names).not.toContain('Org 1 Project');
  });
});
