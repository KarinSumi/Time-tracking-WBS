import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
// @ts-ignore
import app from '../src/app';
// @ts-ignore
import prisma from '../src/lib/prisma';

describe('API Entries', () => {
  let userId: string;

  beforeAll(async () => {
    // Create a seed user and org
    const org = await prisma.organization.create({
      data: { name: 'Test Org' }
    });
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        passwordHash: 'hash',
        orgId: org.id,
        role: 'USER'
      }
    });
    userId = user.id;
  });

  it('should create a real entry in the DB via POST /api/entries', async () => {
    const res = await request(app).post('/api/entries').send({
      hours: 4,
      taskDescription: 'Real DB task',
      userId: userId
    });
    expect(res.status).toBe(201);
    expect(res.body.taskDescription).toBe('Real DB task');
  });
});
