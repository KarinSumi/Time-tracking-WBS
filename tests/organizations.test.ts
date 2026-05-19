import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { cleanupDatabase, createTestUser } from './setup';
import fs from 'fs';
import path from 'path';

describe('Organizations API', () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('PATCH /api/organizations/settings', () => {
    it('should allow admins to update organization settings', async () => {
      const { token } = await createTestUser('ADMIN');

      const res = await request(app)
        .patch('/api/organizations/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'NewOrgName', brandColor: '#ff0000' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('NewOrgName');
      expect(res.body.brandColor).toBe('#ff0000');
    });

    it('should deny non-admins from updating settings', async () => {
      const { token } = await createTestUser('USER');

      const res = await request(app)
        .patch('/api/organizations/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'NewOrgName' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/organizations/logo', () => {
    it('should upload logo and return URL', async () => {
      const { token } = await createTestUser('ADMIN');

      // Create a dummy image file for upload testing
      const dummyFile = path.join(__dirname, 'dummy-logo.png');
      fs.writeFileSync(dummyFile, 'dummy content');

      const res = await request(app)
        .post('/api/organizations/logo')
        .set('Authorization', `Bearer ${token}`)
        .attach('logo', dummyFile);

      fs.unlinkSync(dummyFile);

      expect(res.status).toBe(200);
      expect(res.body.logoUrl).toContain('/uploads/logos/logo-');
    });
  });
});
