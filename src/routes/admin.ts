import express from 'express';
import multer from 'multer';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import * as AdminService from '../services/AdminService';
import * as UserService from '../services/UserService';
import * as TimeEntryService from '../services/TimeEntryService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

// Middleware to enforce SUPER_ADMIN role
const requireSuperAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction): void => {
  if (req.userRole !== 'SUPER_ADMIN') {
    res.status(403).json({ error: 'Access denied. Super Admin role required.' });
    return;
  }
  next();
};

router.use(requireSuperAdmin);

router.get('/users', async (req: AuthRequest, res) => {
  try {
    const users = await UserService.listOrgUsers(req.orgId!);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/entries', async (req: AuthRequest, res) => {
  try {
    const entries = await AdminService.listAdminEntries(req.query, req.orgId!);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/entries/:id', async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const updatedEntry = await TimeEntryService.updateTimeEntry(req.params.id as string, req.body, context);
    res.json(updatedEntry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/entries', async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const newEntry = await AdminService.createAdminEntry(req.body, context);
    res.json(newEntry);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/audit-logs', async (req: AuthRequest, res) => {
  try {
    const logs = await AdminService.getAuditLogs(req.orgId!);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
