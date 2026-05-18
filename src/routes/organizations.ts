import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/tenant';
import * as OrganizationService from '../services/OrganizationService';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

router.use(authMiddleware);

router.get('/settings', async (req: AuthRequest, res) => {
  try {
    const settings = await OrganizationService.getSettings(req.orgId!);
    res.json(settings);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.patch('/settings', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const updated = await OrganizationService.updateSettings(req.body, context);
    res.json(updated);
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/logos/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.svg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

router.post('/logo', requireAdmin, upload.single('logo'), async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  try {
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    await OrganizationService.updateSettings({ logoUrl }, context);
    res.json({ logoUrl });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
