import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import app from '../src/app';
import { createTestUser, cleanupDatabase } from './setup';

const maintenanceFilePath = path.join(__dirname, '../.maintenance');

describe('Maintenance Middleware', () => {
  beforeEach(async () => {
    await cleanupDatabase();
    if (fs.existsSync(maintenanceFilePath)) {
      fs.unlinkSync(maintenanceFilePath);
    }
  });

  afterEach(() => {
    if (fs.existsSync(maintenanceFilePath)) {
      fs.unlinkSync(maintenanceFilePath);
    }
  });

  it('should allow normal requests when maintenance mode is inactive', async () => {
    const { token } = await createTestUser('USER');
    const res = await request(app)
      .get('/api/entries')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('should block regular requests with 503 when maintenance mode is active', async () => {
    fs.writeFileSync(maintenanceFilePath, 'true');
    const { token } = await createTestUser('USER');
    const res = await request(app)
      .get('/api/entries')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(503);
    expect(res.body.error).toContain('maintenance');
  });

  it('should bypass maintenance mode for public paths', async () => {
    fs.writeFileSync(maintenanceFilePath, 'true');
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
