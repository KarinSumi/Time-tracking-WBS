import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import * as PlannedTaskService from '../services/PlannedTaskService';

const router = express.Router();

router.get('/:projectId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const tasks = await PlannedTaskService.getWbsTasks(req.params.projectId as string, req.orgId!);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch WBS data' });
  }
});

export default router;
