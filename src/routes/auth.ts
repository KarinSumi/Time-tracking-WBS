import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import { login, register, getMe, updateAvatar, bulkRegister, BulkUserRow } from '../services/AuthService';
import { requireAdmin } from '../middleware/tenant';
import * as xlsx from 'xlsx';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const result = await login(email, password);
    res.json(result);
  } catch (error: any) {
    const status = error.message === 'Invalid email or password' ? 401 : 500;
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password, orgName } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  try {
    const result = await register(name, email, password, orgName);
    res.status(201).json(result);
  } catch (error: any) {
    const status = error.message.includes('already exists') ? 409 : 500;
    res.status(status).json({ error: error.message || 'Internal server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const jwt = await import('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'aion-dev-secret-key-change-in-production';
    const decoded = jwt.default.verify(authHeader.split(' ')[1]!, secret) as { userId: string };

    const result = await getMe(decoded.userId);
    res.json(result);
  } catch (error: any) {
    const status = error.message === 'User not found' ? 404 : 401;
    res.status(status).json({ error: error.message === 'User not found' ? 'User not found' : 'Invalid token' });
  }
});

// Avatar Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only images are allowed'));
  }
});

// POST /api/auth/profile/avatar
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await updateAvatar(req.userId!, avatarUrl);
    res.json({ avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Bulk upload configuration
const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls' || ext === '.csv') cb(null, true);
    else cb(new Error('Only Excel or CSV files are allowed'));
  }
});

router.post('/bulk-register', authMiddleware, requireAdmin, excelUpload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error('Excel file has no sheets');
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error('Failed to read sheet');
    const rawData = xlsx.utils.sheet_to_json(sheet) as any[];

    const rows: BulkUserRow[] = rawData.map(row => ({
      name: row['Name'] || row['name'],
      email: row['Email'] || row['email'],
      role: row['Role'] || row['role'],
      managerEmail: row['Manager Email'] || row['managerEmail']
    })).filter(row => row.name && row.email); // Basic filter for empty rows

    const result = await bulkRegister(rows, req.orgId!, req.userId!);
    res.json(result);
  } catch (error: any) {
    console.error('Bulk register error:', error);
    res.status(500).json({ error: 'Failed to process bulk registration' });
  }
});

export default router;
