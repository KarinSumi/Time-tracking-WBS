import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import * as SmartInsightsService from '../services/SmartInsightsService';

const router = express.Router();

router.get('/next-task', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const suggestion = await SmartInsightsService.suggestNextTask(req.orgId!, req.userId!);
    res.json(suggestion);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch next task suggestion' });
  }
});

export default router;
