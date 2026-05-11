import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import prisma from '../lib/prisma';
import type { AuthRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/plans — list plans with actual hours aggregation
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }

    const { assigneeId, status, projectId } = req.query;
    const where: Record<string, unknown> = {};

    // Scope to org — get users in same org
    const orgUsers = await prisma.user.findMany({ where: { orgId: user.orgId }, select: { id: true } });
    const orgUserIds = orgUsers.map(u => u.id);
    where.assigneeId = { in: orgUserIds };

    if (assigneeId) where.assigneeId = assigneeId as string;
    if (status) where.status = status as string;
    if (projectId) where.projectId = projectId as string;

    const plans = await prisma.plannedTask.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignedBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        phase: { select: { id: true, name: true } },
        timeEntries: { select: { hours: true } },
      },
      orderBy: { plannedDate: 'desc' },
    });

    // Compute actual hours for each plan
    const result = plans.map(p => ({
      ...p,
      actualHours: p.timeEntries.reduce((sum, e) => sum + Number(e.hours), 0),
      timeEntries: undefined, // Don't send raw entries
    }));

    res.json(result);
  } catch (error) {
    console.error('Fetch plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// POST /api/plans — create a single plan
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { assigneeId, projectId, phaseId, taskDescription, plannedHours, plannedDate } = req.body;

  if (!assigneeId || !taskDescription || !plannedHours) {
    res.status(400).json({ error: 'assigneeId, taskDescription, and plannedHours are required' });
    return;
  }

  try {
    const plan = await prisma.plannedTask.create({
      data: {
        assigneeId,
        assignedById: req.userId!,
        projectId: projectId || null,
        phaseId: phaseId || null,
        taskDescription,
        plannedHours: Number(plannedHours),
        plannedDate: plannedDate ? new Date(plannedDate) : new Date(),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignedBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        phase: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(plan);
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

// PUT /api/plans/:id — update plan
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  const { taskDescription, plannedHours, plannedDate, status, assigneeId, projectId, phaseId } = req.body;

  try {
    const data: Record<string, unknown> = {};
    if (taskDescription !== undefined) data.taskDescription = taskDescription;
    if (plannedHours !== undefined) data.plannedHours = Number(plannedHours);
    if (plannedDate !== undefined) data.plannedDate = new Date(plannedDate as string);
    if (status !== undefined) data.status = status;
    if (assigneeId !== undefined) data.assigneeId = assigneeId;
    if (projectId !== undefined) data.projectId = projectId || null;
    if (phaseId !== undefined) data.phaseId = phaseId || null;

    const plan = await prisma.plannedTask.update({ where: { id }, data });
    res.json(plan);
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// DELETE /api/plans/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  try {
    await prisma.timeEntry.updateMany({ where: { plannedTaskId: id }, data: { plannedTaskId: null } });
    await prisma.plannedTask.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

// POST /api/plans/upload — parse Excel file and create plans
router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) { res.status(400).json({ error: 'Empty workbook' }); return; }

    const sheet = workbook.Sheets[sheetName]!;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (rows.length === 0) { res.status(400).json({ error: 'No data rows found' }); return; }

    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }

    // Fetch lookup data
    const orgUsers = await prisma.user.findMany({ where: { orgId: user.orgId }, select: { id: true, email: true, name: true } });
    const orgProjects = await prisma.project.findMany({ where: { orgId: user.orgId }, select: { id: true, name: true } });
    const orgPhases = await prisma.phase.findMany({ where: { orgId: user.orgId }, select: { id: true, name: true } });

    const results: Array<{ row: number; status: 'success' | 'error'; message: string; data?: unknown }> = [];
    let created = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowNum = i + 2; // Excel row (1-indexed + header)

      const email = String(row['Assignee Email'] || row['email'] || row['Email'] || '').trim();
      const projectName = String(row['Project'] || row['project'] || '').trim();
      const phaseName = String(row['Phase'] || row['phase'] || '').trim();
      const desc = String(row['Task Description'] || row['task'] || row['Task'] || row['Description'] || '').trim();
      const hours = Number(row['Planned Hours'] || row['hours'] || row['Hours'] || 0);
      const dateVal = row['Date'] || row['date'] || row['Planned Date'] || '';

      // Validate
      if (!email) { results.push({ row: rowNum, status: 'error', message: 'Missing assignee email' }); continue; }
      if (!desc) { results.push({ row: rowNum, status: 'error', message: 'Missing task description' }); continue; }
      if (!hours || hours <= 0) { results.push({ row: rowNum, status: 'error', message: 'Invalid planned hours' }); continue; }

      const assignee = orgUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!assignee) { results.push({ row: rowNum, status: 'error', message: `User "${email}" not found in organization` }); continue; }

      const project = projectName ? orgProjects.find(p => p.name.toLowerCase() === projectName.toLowerCase()) : null;
      const phase = phaseName ? orgPhases.find(p => p.name.toLowerCase() === phaseName.toLowerCase()) : null;

      let parsedDate = new Date();
      if (dateVal) {
        if (typeof dateVal === 'number') {
          // Excel serial date
          parsedDate = new Date((dateVal - 25569) * 86400 * 1000);
        } else {
          parsedDate = new Date(String(dateVal));
        }
        if (isNaN(parsedDate.getTime())) parsedDate = new Date();
      }

      try {
        await prisma.plannedTask.create({
          data: {
            assigneeId: assignee.id,
            assignedById: req.userId!,
            projectId: project?.id || null,
            phaseId: phase?.id || null,
            taskDescription: desc,
            plannedHours: hours,
            plannedDate: parsedDate,
          },
        });
        created++;
        results.push({ row: rowNum, status: 'success', message: `Plan created for ${assignee.name || email}` });
      } catch (err) {
        results.push({ row: rowNum, status: 'error', message: 'Database error creating plan' });
      }
    }

    res.json({ total: rows.length, created, errors: results.filter(r => r.status === 'error').length, results });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to parse Excel file' });
  }
});

// GET /api/plans/template — download xlsx template
router.get('/template', (req, res) => {
  const wb = XLSX.utils.book_new();
  const data = [
    ['Assignee Email', 'Project', 'Phase', 'Task Description', 'Planned Hours', 'Date'],
    ['admin@example.com', 'Dashboard App', 'Development', 'Build login page', 8, '2026-05-10'],
    ['admin@example.com', 'API Backend', 'Testing', 'Write unit tests', 4, '2026-05-11'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 30 }, { wch: 14 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Plan Template');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=plan_template.xlsx');
  res.send(Buffer.from(buf));
});

// GET /api/plans/users — list org users for assignee dropdown
router.get('/users', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (!user) { res.status(401).json({ error: 'User not found' }); return; }
    const users = await prisma.user.findMany({
      where: { orgId: user.orgId },
      select: { id: true, name: true, email: true, avatarUrl: true, role: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
