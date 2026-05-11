import express from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(authMiddleware);

// Middleware to enforce SUPER_ADMIN role
const requireSuperAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction): void => {
  if (req.userRole !== 'SUPER_ADMIN') {
    res.status(403).json({ error: 'Access denied. Super Admin role required.' });
    return;
  }
  next();
};

router.use(requireSuperAdmin);

// Fetch all users for the dropdown filter
router.get('/users', async (req: AuthRequest, res: express.Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, avatarUrl: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/entries
// Fetch all time entries with user, project, and phase details for the grid
router.get('/entries', async (req: AuthRequest, res: express.Response) => {
  try {
    const { userId, projectId, startDate, endDate } = req.query;
    
    const whereClause: any = {};
    if (userId) whereClause.userId = userId as string;
    if (projectId) whereClause.projectId = projectId as string;
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate as string);
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        whereClause.date.lte = end;
      }
    }

    const entries = await prisma.timeEntry.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        phase: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 200, // Limit for performance, in real app add pagination
    });
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching admin entries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/admin/entries/:id
// Update a specific time entry inline
router.patch('/entries/:id', async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { hours, taskDescription, projectId, phaseId, date } = req.body;

    const dataToUpdate: any = {};
    if (hours !== undefined) dataToUpdate.hours = hours;
    if (taskDescription !== undefined) dataToUpdate.taskDescription = taskDescription;
    if (projectId !== undefined) dataToUpdate.projectId = projectId;
    if (phaseId !== undefined) dataToUpdate.phaseId = phaseId;
    if (date !== undefined) dataToUpdate.date = new Date(date);

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: id as string },
      data: dataToUpdate,
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        phase: { select: { id: true, name: true } },
      },
    });

    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/entries
// Create a new entry for any user
router.post('/entries', async (req: AuthRequest, res: express.Response) => {
  try {
    const { userId, hours, taskDescription, projectId, phaseId, date } = req.body;

    if (!userId || hours === undefined || !taskDescription) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const newEntry = await prisma.timeEntry.create({
      data: {
        userId,
        hours,
        taskDescription,
        date: date ? new Date(date) : new Date(),
        projectId: projectId || null,
        phaseId: phaseId || null,
        status: 'DRAFT',
      },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        phase: { select: { id: true, name: true } },
      },
    });

    res.json(newEntry);
  } catch (error) {
    console.error('Error creating admin entry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/entries/upload
// Parse Excel file and create time entries in bulk
router.post('/entries/upload', upload.single('file'), async (req: AuthRequest, res: express.Response) => {
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

    // Fetch org lookup data
    const orgUsers = await prisma.user.findMany({ where: { orgId: user.orgId }, select: { id: true, email: true, name: true } });
    const orgProjects = await prisma.project.findMany({ where: { orgId: user.orgId }, select: { id: true, name: true } });
    const orgPhases = await prisma.phase.findMany({ where: { orgId: user.orgId }, select: { id: true, name: true } });

    const results: Array<{ row: number; status: 'success' | 'error'; message: string }> = [];
    let created = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]!;
      const rowNum = i + 2;

      const email = String(row['Employee Email'] || row['Email'] || '').trim();
      const projectName = String(row['Project'] || row['project'] || '').trim();
      const phaseName = String(row['Phase'] || row['phase'] || '').trim();
      const desc = String(row['Task Description'] || row['Task'] || '').trim();
      const hours = Number(row['Hours'] || row['hours'] || 0);
      const dateVal = row['Date'] || row['date'] || '';

      if (!email) { results.push({ row: rowNum, status: 'error', message: 'Missing email' }); continue; }
      if (!desc) { results.push({ row: rowNum, status: 'error', message: 'Missing description' }); continue; }
      if (!hours || hours <= 0) { results.push({ row: rowNum, status: 'error', message: 'Invalid hours' }); continue; }

      const assignee = orgUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!assignee) { results.push({ row: rowNum, status: 'error', message: `User "${email}" not found in org` }); continue; }

      const project = projectName ? orgProjects.find(p => p.name.toLowerCase() === projectName.toLowerCase()) : null;
      const phase = phaseName ? orgPhases.find(p => p.name.toLowerCase() === phaseName.toLowerCase()) : null;

      let parsedDate = new Date();
      if (dateVal) {
        if (typeof dateVal === 'number') {
          parsedDate = new Date((dateVal - 25569) * 86400 * 1000);
        } else {
          parsedDate = new Date(String(dateVal));
        }
        if (isNaN(parsedDate.getTime())) parsedDate = new Date();
      }

      try {
        await prisma.timeEntry.create({
          data: {
            userId: assignee.id,
            projectId: project?.id || null,
            phaseId: phase?.id || null,
            taskDescription: desc,
            hours,
            date: parsedDate,
            status: 'SUBMITTED', // SuperAdmin entries are typically finalized
          },
        });
        created++;
        results.push({ row: rowNum, status: 'success', message: `Entry created for ${assignee.name || email}` });
      } catch (err) {
        results.push({ row: rowNum, status: 'error', message: 'Database error creating entry' });
      }
    }

    res.json({ total: rows.length, created, errors: results.filter(r => r.status === 'error').length, results });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to parse Excel file' });
  }
});

export default router;
