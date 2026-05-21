import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/lib/prisma';
import { createTestUser, cleanupDatabase } from './setup';

describe('Suggestions API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  it('should return NO_TASKS when no plans or projects exist', async () => {
    const { token } = await createTestUser('USER');
    const res = await request(app)
      .get('/api/suggestions/next-task')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('NO_TASKS');
    expect(res.body.projectName).toBe('N/A');
  });

  it('should suggest active planned tasks for the user', async () => {
    const { user, orgId, token } = await createTestUser('USER');
    
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        orgId
      }
    });

    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 1);
    const end = new Date(now);
    end.setDate(now.getDate() + 1);

    await prisma.plannedTask.create({
      data: {
        assigneeId: user.id,
        assignedById: user.id,
        projectId: project.id,
        taskDescription: 'Implement cool feature',
        plannedHours: 12,
        startDate: start,
        endDate: end,
        status: 'PENDING'
      }
    });

    const res = await request(app)
      .get('/api/suggestions/next-task')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.type).toBe('PLAN');
    expect(res.body.title).toBe('Implement cool feature');
    expect(res.body.projectName).toBe('Test Project');
    expect(res.body.hoursLeft).toBe(12);
  });
});
