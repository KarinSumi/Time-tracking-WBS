import { describe, it, expect } from 'vitest';
import request from 'supertest';
// @ts-ignore
import app from '../src/app';

describe('GET /health', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
