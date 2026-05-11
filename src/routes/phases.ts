import express from 'express';
import prisma from '../lib/prisma';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/phases
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }

    const phases = await prisma.phase.findMany({
      where: { orgId: user.orgId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { timeEntries: true } } },
    });
    res.json(phases);
  } catch (error) {
    console.error('Fetch phases error:', error);
    res.status(500).json({ error: 'Failed to fetch phases' });
  }
});

// POST /api/phases
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { name, sortOrder } = req.body;
  if (!name?.trim()) { res.status(400).json({ error: 'Phase name is required' }); return; }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }

    const maxOrder = await prisma.phase.aggregate({ where: { orgId: user.orgId }, _max: { sortOrder: true } });
    const phase = await prisma.phase.create({
      data: { name: name.trim(), sortOrder: sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1, orgId: user.orgId },
    });
    res.status(201).json(phase);
  } catch (error) {
    console.error('Create phase error:', error);
    res.status(500).json({ error: 'Failed to create phase' });
  }
});

// PUT /api/phases/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const { name, sortOrder } = req.body;

  try {
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (sortOrder !== undefined) data.sortOrder = sortOrder;

    const phase = await prisma.phase.update({ where: { id }, data });
    res.json(phase);
  } catch (error) {
    console.error('Update phase error:', error);
    res.status(500).json({ error: 'Failed to update phase' });
  }
});

// DELETE /api/phases/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  try {
    await prisma.timeEntry.updateMany({ where: { phaseId: id }, data: { phaseId: null } });
    await prisma.phase.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete phase error:', error);
    res.status(500).json({ error: 'Failed to delete phase' });
  }
});

export default router;
