import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { createTestUser, cleanupDatabase } from './setup';

describe('Time Entries API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  it('should create an entry for authorized user', async () => {
    const { token, user } = await createTestUser();
    const res = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hours: 4,
        taskDescription: 'Coding session',
        date: new Date().toISOString()
      });

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(user.id);
  });

  it('should enforce tenant isolation on list', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    // Create entry for user 1
    await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ hours: 1, taskDescription: 'U1 Task', date: new Date().toISOString() });

    // User 2 should NOT see user 1's entry
    const res = await request(app)
      .get('/api/entries')
      .set('Authorization', `Bearer ${user2.token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it('should allow admin to see all org entries', async () => {
    const admin = await createTestUser('ADMIN');
    const user = await createTestUser('USER', admin.orgId);

    // Create entry for user
    await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ hours: 1, taskDescription: 'User Task', date: new Date().toISOString() });

    // Admin in same org should see it
    const res = await request(app)
      .get('/api/entries')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should prevent user from deleting another user entry', async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    const postRes = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ hours: 1, taskDescription: 'U1 Secret Task', date: new Date().toISOString() });
    
    const entryId = postRes.body.id;

    const delRes = await request(app)
      .delete(`/api/entries/${entryId}`)
      .set('Authorization', `Bearer ${user2.token}`);

    expect(delRes.status).toBe(403);
  });

  it('should invalidate cache on new entry creation so it appears immediately', async () => {
    const { token, user } = await createTestUser();

    // 1. Initial list (populates cache)
    const res1 = await request(app)
      .get('/api/entries')
      .set('Authorization', `Bearer ${token}`);
    expect(res1.status).toBe(200);
    expect(res1.body.length).toBe(0);

    // 2. Create a new entry (should trigger cache invalidation)
    const createRes = await request(app)
      .post('/api/entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        hours: 6,
        taskDescription: 'Testing Cache Invalidation',
        date: new Date().toISOString()
      });
    expect(createRes.status).toBe(201);

    // 3. Immediately list again and assert the entry is returned
    const res2 = await request(app)
      .get('/api/entries')
      .set('Authorization', `Bearer ${token}`);
    expect(res2.status).toBe(200);
    expect(res2.body.length).toBe(1);
    expect(res2.body[0].taskDescription).toBe('Testing Cache Invalidation');
  });
});
