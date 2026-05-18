import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { cleanupDatabase, createTestUser } from './setup';

describe('Auth API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        orgName: 'Acme Corp'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'john@example.com');
    expect(res.body.user).toHaveProperty('orgName', 'Acme Corp');
  });

  it('should login an existing user', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123'
    });
    
    expect(regRes.status).toBe(201);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'jane@example.com');
  });

  it('should get current user profile with valid token', async () => {
    const { user, token } = await createTestUser();

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', user.email);
  });
});
