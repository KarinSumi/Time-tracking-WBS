import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { validateBody, validateParams, idParamSchema } from '../middleware/validate';
import * as ProjectService from '../services/ProjectService';
import { z } from 'zod';

const router = express.Router();

const projectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required')
}).passthrough();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const projects = await ProjectService.listProjects(req.orgId!);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/', authMiddleware, validateBody(projectSchema), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const project = await ProjectService.createProject(req.body, context);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(projectSchema.partial()), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const project = await ProjectService.updateProject(req.params.id, req.body, context);
    res.json(project);
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    await ProjectService.deleteProject(req.params.id, context);
    res.json({ success: true });
  } catch (error: any) {
    res.status(error.message?.includes('Only Super Admins') ? 403 : 404).json({ error: error.message });
  }
});

router.get('/:id', authMiddleware, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const project = await ProjectService.getProject(req.params.id, req.orgId!);
    res.json(project);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.get('/:id/stats', authMiddleware, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const stats = await ProjectService.getProjectStats(req.params.id, req.orgId!);
    res.json(stats);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
