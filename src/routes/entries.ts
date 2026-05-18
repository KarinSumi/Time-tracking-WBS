import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { requireFields } from '../middleware/validate';
import * as TimeEntryService from '../services/TimeEntryService';

const router = express.Router();

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const entries = await TimeEntryService.listEntries(req.query, context);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

router.post('/', authMiddleware, requireFields(['hours', 'taskDescription', 'date']), async (req: AuthRequest, res) => {
  try {
    const entry = await TimeEntryService.createEntry(req.body, req.userId!);
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create entry' });
  }
});

router.post('/multi-day', authMiddleware, requireFields(['startDate', 'endDate', 'hoursPerDay', 'taskDescription']), async (req: AuthRequest, res) => {
  try {
    const results = await TimeEntryService.createMultiDayEntries(req.body, req.userId!);
    res.status(201).json({ success: true, count: results.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to generate multi-day logs' });
  }
});

router.post('/bulk', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({ error: 'Body must be an array of entries' });
      return;
    }
    const results = await TimeEntryService.createBulkEntries(req.body, req.userId!);
    res.status(201).json({ success: true, count: results.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create bulk entries' });
  }
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const entry = await TimeEntryService.updateTimeEntry(req.params.id as string, req.body, context);
    res.json(entry);
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    await TimeEntryService.deleteTimeEntry(req.params.id as string, context);
    res.json({ success: true });
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
  }
});

router.post('/bulk-status', authMiddleware, requireFields(['ids', 'status']), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const { ids, status } = req.body;
    const result = await TimeEntryService.updateBulkStatus(ids, status, context);
    res.json({ success: true, count: result.count });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/summary/drafts', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const count = await TimeEntryService.getDraftCount(req.userId!);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch draft summary' });
  }
});

export default router;
