import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { validateParams, idParamSchema } from '../middleware/validate';
import { listHolidays, createHoliday, updateHoliday, deleteHoliday } from '../services/HolidayService';

const router = express.Router();

/**
 * GET /api/holidays
 * Returns all holidays for the organization, sorted chronologically.
 */
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const holidays = await listHolidays({ userId: req.userId!, orgId: req.orgId!, role: req.userRole! });
    res.json(holidays);
  } catch (error: any) {
    console.error('Fetch holidays error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch holidays' });
  }
});

/**
 * POST /api/holidays
 * Creates a new holiday. Checks for duplicates on the same date.
 */
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { date, description } = req.body;
  if (!date || !description) return res.status(400).json({ error: 'Date and description are required' });

  try {
    const holiday = await createHoliday({ date, description }, { userId: req.userId!, orgId: req.orgId!, role: req.userRole! });
    res.status(201).json(holiday);
  } catch (error: any) {
    console.error('Create holiday error:', error);
    const status = error.message.includes('already exists') ? 400 : 500;
    res.status(status).json({ error: error.message || 'Failed to create holiday' });
  }
});

/**
 * PUT /api/holidays/:id
 * Updates an existing holiday.
 */
router.put('/:id', authMiddleware, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const holiday = await updateHoliday(req.params.id, req.body, { userId: req.userId!, orgId: req.orgId!, role: req.userRole! });
    res.json(holiday);
  } catch (error: any) {
    console.error('Update holiday error:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: error.message || 'Failed to update holiday' });
  }
});

/**
 * DELETE /api/holidays/:id
 * Deletes a holiday record.
 */
router.delete('/:id', authMiddleware, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    await deleteHoliday(req.params.id, { userId: req.userId!, orgId: req.orgId!, role: req.userRole! });
    res.status(204).send();
  } catch (error: any) {
    console.error('Delete holiday error:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({ error: error.message || 'Failed to delete holiday' });
  }
});

export default router;
