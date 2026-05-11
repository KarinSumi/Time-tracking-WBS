import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken } from '../middleware/auth';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check password — support both hashed and plaintext (for seed data)
    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(password, user.passwordHash);
    } catch {
      // If bcrypt fails (plaintext hash from seed), do direct compare
      validPassword = password === user.passwordHash;
    }

    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        orgName: user.organization.name,
        orgId: user.orgId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Find or create organization
    let org;
    if (orgName) {
      org = await prisma.organization.findFirst({ where: { name: orgName } });
      if (!org) {
        org = await prisma.organization.create({ data: { name: orgName } });
      }
    } else {
      // Use default org or create one
      org = await prisma.organization.findFirst();
      if (!org) {
        org = await prisma.organization.create({ data: { name: 'Default Organization' } });
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        orgId: org.id,
        role: 'USER',
        avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
      },
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        orgName: org.name,
        orgId: user.orgId,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      orgName: user.organization.name,
      orgId: user.orgId,
    });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
