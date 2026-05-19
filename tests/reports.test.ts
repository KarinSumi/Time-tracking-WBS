import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { cleanupDatabase, createTestUser } from './setup';

describe('Reports API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/reports/capacity', () => {
    it('should return 400 if startDate or endDate are missing', async () => {
      const { token } = await createTestUser('ADMIN');

      const res = await request(app)
        .get('/api/reports/capacity')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('startDate and endDate are required');
    });

    it('should return capacity report for a valid date range', async () => {
      const { token } = await createTestUser('ADMIN');

      const startDate = '2026-05-01';
      const endDate = '2026-05-31';

      const res = await request(app)
        .get(`/api/reports/capacity?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/reports/forecasting', () => {
    it('should return forecasting report', async () => {
      const { token } = await createTestUser('ADMIN');

      const res = await request(app)
        .get('/api/reports/forecasting')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});
