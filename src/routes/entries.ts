import express from 'express';
import prisma from '../lib/prisma';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/entries — list entries (optionally filtered)
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, status, userId: filterUserId } = req.query;

    const where: Record<string, unknown> = {};

    if (filterUserId) {
      where.userId = filterUserId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate as string);
      if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate as string);
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        phase: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });

    res.json(entries);
  } catch (error) {
    console.error('Fetch entries error:', error);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// POST /api/entries — create entry
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { hours, taskDescription, date, projectId, phaseId, plannedTaskId } = req.body;

  if (!taskDescription || !hours) {
    res.status(400).json({ error: 'taskDescription and hours are required' });
    return;
  }

  try {
    const entry = await prisma.timeEntry.create({
      data: {
        hours,
        taskDescription,
        userId: req.userId!,
        date: date ? new Date(date) : new Date(),
        status: 'DRAFT',
        projectId: projectId || null,
        phaseId: phaseId || null,
        plannedTaskId: plannedTaskId || null,
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        phase: { select: { id: true, name: true } },
        plannedTask: { select: { id: true, taskDescription: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'TimeEntry',
        entityId: entry.id,
        action: 'CREATE',
        performedBy: req.userId!,
        newValues: { hours, taskDescription, date, projectId, phaseId, plannedTaskId } as object,
      },
    });

    if (plannedTaskId) {
      // Auto-update plan status to IN_PROGRESS if it's PENDING
      await prisma.plannedTask.updateMany({
        where: { id: plannedTaskId, status: 'PENDING' },
        data: { status: 'IN_PROGRESS' }
      });
      
      // Auto-complete if actual hours >= planned
      const plan = await prisma.plannedTask.findUnique({
        where: { id: plannedTaskId },
        include: { timeEntries: { select: { hours: true } } }
      });
      if (plan) {
        const totalHours = plan.timeEntries.reduce((sum, e) => sum + Number(e.hours), 0);
        if (totalHours >= Number(plan.plannedHours) && plan.status !== 'COMPLETED') {
          await prisma.plannedTask.update({ where: { id: plannedTaskId }, data: { status: 'COMPLETED' } });
        }
      }
    }

    res.status(201).json(entry);
  } catch (error) {
    console.error('Create entry error:', error);
    res.status(500).json({ error: 'Failed to create entry' });
  }
});

// PUT /api/entries/:id — update entry
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const { hours, taskDescription, date, status } = req.body;

  try {
    const oldEntry = await prisma.timeEntry.findUnique({ where: { id } });
    if (!oldEntry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    // Only allow status update from DRAFT to SUBMITTED if it's already SUBMITTED
    if (oldEntry.status === 'SUBMITTED') {
      res.status(403).json({ error: 'Cannot edit a submitted entry' });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (hours !== undefined) updateData.hours = hours;
    if (taskDescription !== undefined) updateData.taskDescription = taskDescription;
    if (date !== undefined) updateData.date = new Date(date);
    if (status !== undefined) updateData.status = status;

    const entry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        phase: { select: { id: true, name: true } },
        plannedTask: { select: { id: true, taskDescription: true } },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'TimeEntry',
        entityId: id!,
        action: 'UPDATE',
        performedBy: req.userId!,
        oldValues: oldEntry as object,
        newValues: entry as object,
      },
    });

    res.json(entry);
  } catch (error) {
    console.error('Update entry error:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// DELETE /api/entries/:id — delete entry
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;

  try {
    const entry = await prisma.timeEntry.findUnique({ where: { id } });
    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    if (entry.status === 'SUBMITTED') {
      res.status(403).json({ error: 'Cannot delete a submitted entry' });
      return;
    }

    await prisma.timeEntry.delete({ where: { id } });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'TimeEntry',
        entityId: id!,
        action: 'DELETE',
        performedBy: req.userId!,
        oldValues: entry as object,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete entry error:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

export default router;
