import express from 'express';
import prisma from '../lib/prisma';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/projects
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }

    const projects = await prisma.project.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { timeEntries: true } } },
    });
    res.json(projects);
  } catch (error) {
    console.error('Fetch projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { name, color } = req.body;
  if (!name?.trim()) { res.status(400).json({ error: 'Project name is required' }); return; }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }

    const project = await prisma.project.create({
      data: { name: name.trim(), color: color || '#3b82f6', orgId: user.orgId },
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const { name, color, status } = req.body;

  try {
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (color !== undefined) data.color = color;
    if (status !== undefined) data.status = status;

    const project = await prisma.project.update({ where: { id }, data });
    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  try {
    // Unlink entries first
    await prisma.timeEntry.updateMany({ where: { projectId: id }, data: { projectId: null } });
    await prisma.project.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
