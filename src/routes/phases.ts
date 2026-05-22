import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { requireAdmin } from '../middleware/tenant';
import { validateParams, idParamSchema } from '../middleware/validate';
import * as PhaseService from '../services/PhaseService';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const phases = await PhaseService.listPhases(req.orgId!);
    res.json(phases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch phases' });
  }
});

router.post('/', authMiddleware, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const phase = await PhaseService.createPhase(req.body, context);
    res.status(201).json(phase);
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, requireAdmin, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const phase = await PhaseService.updatePhase(req.params.id, req.body, context);
    res.json(phase);
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, requireAdmin, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    await PhaseService.deletePhase(req.params.id, context);
    res.json({ success: true });
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
});

export default router;
