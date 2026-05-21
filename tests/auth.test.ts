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
        password: 'Password123!',
        orgName: 'Acme Corp'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'john@example.com');
    expect(res.body.user).toHaveProperty('orgName', 'Acme Corp');
  });

  it('should reject registration with weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Weak User',
        email: 'weak@example.com',
        password: 'weak',
        orgName: 'Stitch'
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('at least 8 characters');
  });

  it('should login an existing user', async () => {
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123!'
    });
    
    expect(regRes.status).toBe(201);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'jane@example.com',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'jane@example.com');
  });

  it('should temporarily lock account after 5 failed logins', async () => {
    // Register the user first
    const regRes = await request(app).post('/api/auth/register').send({
      name: 'Lockout User',
      email: 'lockout@example.com',
      password: 'Password123!'
    });
    expect(regRes.status).toBe(201);

    // Attempt 5 incorrect logins
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'lockout@example.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
    }

    // 6th attempt should return 423 Locked
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'lockout@example.com', password: 'Password123!' });
    expect(res.status).toBe(423);
    expect(res.body.error).toContain('locked');
  });

  it('should get current user profile with valid token', async () => {
    const { user, token } = await createTestUser();

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', user.email);
  });

  it('should bulk register users', async () => {
    const { token, user: adminUser } = await createTestUser('ADMIN');
    
    // Create a simple CSV buffer instead of full XLSX to test the parsing logic if multer supports CSV, 
    // but the endpoint uses xlsx library which handles CSV as well.
    const csvContent = `Name,Email,Role,Manager Email\nBulk User 1,bulk1@example.com,USER,\nBulk User 2,bulk2@example.com,MANAGER,${adminUser.email}`;
    const fileBuffer = Buffer.from(csvContent);

    const res = await request(app)
      .post('/api/auth/bulk-register')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', fileBuffer, 'users.csv');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('created', 2);
    expect(res.body).toHaveProperty('skipped', 0);
  });
});
