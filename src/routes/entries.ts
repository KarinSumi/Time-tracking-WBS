import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { validateBody, validateParams, idParamSchema } from '../middleware/validate';
import * as TimeEntryService from '../services/TimeEntryService';
import { z } from 'zod';

const router = express.Router();

const isoDateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:?\d{2})?)?$/;

const timeEntrySchema = z.object({
  hours: z.coerce.number().gt(0, 'Hours must be greater than 0').lte(24, 'Hours cannot exceed 24'),
  date: z.string().refine((val) => isoDateRegex.test(val), 'Invalid ISO date format'),
  taskDescription: z.string().trim().min(1, 'Task description is required'),
  projectId: z.string().uuid('Invalid UUID format').optional().nullable(),
  phaseId: z.string().uuid('Invalid UUID format').optional().nullable(),
  plannedTaskId: z.string().uuid('Invalid UUID format').optional().nullable(),
  billable: z.boolean().optional(),
  billingRate: z.number().nullable().optional(),
}).passthrough();

const multiDaySchema = z.object({
  startDate: z.string().refine((val) => isoDateRegex.test(val), 'Invalid ISO date format'),
  endDate: z.string().refine((val) => isoDateRegex.test(val), 'Invalid ISO date format'),
  hoursPerDay: z.coerce.number().gt(0, 'Hours must be greater than 0').lte(24, 'Hours cannot exceed 24'),
  taskDescription: z.string().trim().min(1, 'Task description is required'),
  projectId: z.string().uuid('Invalid UUID format').optional().nullable(),
  phaseId: z.string().uuid('Invalid UUID format').optional().nullable(),
  billable: z.boolean().optional(),
  billingRate: z.number().nullable().optional(),
}).passthrough();

const bulkSchema = z.array(timeEntrySchema);

const bulkStatusSchema = z.object({
  ids: z.array(z.string().uuid('Invalid UUID format')),
  status: z.string().min(1, 'Status is required'),
});

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const entries = await TimeEntryService.listEntries(req.query, context);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

router.post('/', authMiddleware, validateBody(timeEntrySchema), async (req: AuthRequest, res) => {
  try {
    const entry = await TimeEntryService.createEntry(req.body, req.userId!);
    res.status(201).json(entry);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create entry' });
  }
});

router.post('/multi-day', authMiddleware, validateBody(multiDaySchema), async (req: AuthRequest, res) => {
  try {
    const results = await TimeEntryService.createMultiDayEntries(req.body, req.userId!);
    res.status(201).json({ success: true, count: results.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to generate multi-day logs' });
  }
});

router.post('/bulk', authMiddleware, validateBody(bulkSchema), async (req: AuthRequest, res) => {
  try {
    const results = await TimeEntryService.createBulkEntries(req.body, req.userId!);
    res.status(201).json({ success: true, count: results.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create bulk entries' });
  }
});

router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(timeEntrySchema.partial()), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const entry = await TimeEntryService.updateTimeEntry(req.params.id, req.body, context);
    res.json(entry);
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    await TimeEntryService.deleteTimeEntry(req.params.id, context);
    res.json({ success: true });
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
  }
});

router.post('/bulk-status', authMiddleware, validateBody(bulkStatusSchema), async (req: AuthRequest, res) => {
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
