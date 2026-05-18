import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { cleanupDatabase, createTestUser } from './setup';

describe('Admin API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it('should deny access to regular users', async () => {
    const { token } = await createTestUser('USER');
    
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.status).toBe(403);
  });

  it('should deny access to regular admins', async () => {
    const { token } = await createTestUser('ADMIN');
    
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.status).toBe(403);
  });

  it('should allow access to super admins', async () => {
    const { token } = await createTestUser('SUPER_ADMIN');
    
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.status).toBe(200);
  });
});
