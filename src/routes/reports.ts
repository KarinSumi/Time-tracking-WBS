import express from 'express';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import * as ReportService from '../services/ReportService';

const router = express.Router();

router.get('/capacity', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }
    const report = await ReportService.getCapacityReport(startDate as string, endDate as string, req.orgId!);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate capacity data' });
  }
});

router.get('/forecasting', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const forecast = await ReportService.getForecastReport(req.orgId!);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

export default router;
