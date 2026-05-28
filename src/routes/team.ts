import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/tenant';
import { validateParams, idParamSchema } from '../middleware/validate';
import * as UserService from '../services/UserService';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const members = await UserService.listOrgUsers(req.orgId!);
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

router.patch('/:id/role', requireAdmin, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updated = await UserService.updateUserRole(id as string, role, req.orgId!, req.userId!);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/:id/manager', requireAdmin, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { managerId } = req.body;
    const updated = await UserService.updateUserManager(id as string, managerId, req.orgId!, req.userId!);
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
