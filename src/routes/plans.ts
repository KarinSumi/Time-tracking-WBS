import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { requireFields, validateParams, idParamSchema } from '../middleware/validate';
import * as PlannedTaskService from '../services/PlannedTaskService';
import * as UserService from '../services/UserService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const plans = await PlannedTaskService.listPlans(req.orgId!);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

router.post('/', authMiddleware, requireFields(['assigneeId', 'taskDescription', 'plannedHours']), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const plan = await PlannedTaskService.createPlan(req.body, context);
    res.status(201).json(plan);
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 400).json({ error: error.message });
  }
});

router.put('/:id', authMiddleware, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const plan = await PlannedTaskService.updatePlan((req.params.id as string), req.body, context);
    res.json(plan);
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
});

router.delete('/:id', authMiddleware, validateParams(idParamSchema), async (req: AuthRequest, res) => {
  try {
    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    await PlannedTaskService.deletePlan((req.params.id as string), context);
    res.json({ success: true });
  } catch (error: any) {
    res.status(error.message === 'Unauthorized' ? 403 : 404).json({ error: error.message });
  }
});

router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error('Empty workbook');

    const sheet = workbook.Sheets[sheetName]!;
    const rows = XLSX.utils.sheet_to_json<any>(sheet);
    if (rows.length === 0) throw new Error('No data rows found');

    const context = { userId: req.userId!, orgId: req.orgId!, role: req.userRole! };
    const results = await PlannedTaskService.uploadPlans(rows, context);
    res.json({ success: true, count: results.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/template', (req, res) => {
  const wb = XLSX.utils.book_new();
  const data = [
    ['Assignee Email', 'Project', 'Phase', 'Task Description', 'Planned Hours', 'Date'],
    ['admin@example.com', 'Dashboard App', 'Development', 'Build login page', 8, '2026-05-10'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Plan Template');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=plan_template.xlsx');
  res.send(Buffer.from(buf));
});

router.get('/users', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const users = await UserService.listOrgUsers(req.orgId!);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
