import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken } from '../middleware/auth';
import { loginRateLimiter } from '../utils/rateLimiter';

export async function login(email: string, password: string) {
  const lockStatus = loginRateLimiter.isLocked(email);
  if (lockStatus.locked) {
    const mins = Math.ceil(lockStatus.remainingMs / 60000);
    throw new Error(`Account is temporarily locked. Please try again in ${mins} minutes.`);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });

  if (!user) {
    loginRateLimiter.recordFailure(email);
    throw new Error('Invalid email or password');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    loginRateLimiter.recordFailure(email);
    const updatedStatus = loginRateLimiter.isLocked(email);
    if (updatedStatus.locked) {
      await prisma.auditLog.create({
        data: {
          entityType: 'SECURITY',
          entityId: user.id,
          action: 'BRUTE_FORCE_LOCKOUT',
          performedBy: user.id,
          newValues: { email, reason: '5 consecutive failed login attempts' }
        }
      });
    }
    throw new Error('Invalid email or password');
  }

  // Reset failures on successful login
  loginRateLimiter.reset(email);

  const token = generateToken(user.id, user.role, user.orgId);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      orgName: user.organization.name,
      orgId: user.orgId,
      brandColor: user.organization.brandColor,
      logoUrl: user.organization.logoUrl,
    },
  };
}

import { validatePassword } from '../utils/security';

export async function register(name: string, email: string, password: string, orgName?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('An account with this email already exists');

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.valid) {
    throw new Error(passwordCheck.reason || 'Password does not meet complexity requirements');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let org;
  if (orgName) {
    org = await prisma.organization.findFirst({ where: { name: orgName } });
    if (!org) {
      org = await prisma.organization.create({ data: { name: orgName, brandColor: '#3b82f6' } });
    }
  } else {
    org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({ data: { name: 'Default Organization', brandColor: '#3b82f6' } });
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

  const token = generateToken(user.id, user.role, user.orgId);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      orgName: org.name,
      orgId: user.orgId,
      brandColor: org.brandColor,
      logoUrl: org.logoUrl,
    },
  };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { organization: true },
  });

  if (!user) throw new Error('User not found');

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    orgName: user.organization.name,
    orgId: user.orgId,
    brandColor: user.organization.brandColor,
    logoUrl: user.organization.logoUrl,
  };
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl }
  });
  return avatarUrl;
}

export interface BulkUserRow {
  name: string;
  email: string;
  role?: string;
  managerEmail?: string;
}

export async function bulkRegister(rows: BulkUserRow[], orgId: string, performedBy: string) {
  const result = { created: 0, skipped: 0, errors: [] as string[] };
  const passwordHash = await bcrypt.hash('Welcome@2026', 10);

  for (const [index, row] of rows.entries()) {
    try {
      if (!row.name || !row.email) {
        result.errors.push(`Row ${index + 2}: Name and email are required.`);
        result.skipped++;
        continue;
      }

      const existing = await prisma.user.findUnique({ where: { email: row.email } });
      if (existing) {
        result.skipped++;
        continue;
      }

      let managerId: string | null = null;
      if (row.managerEmail) {
        const manager = await prisma.user.findUnique({ where: { email: row.managerEmail } });
        if (manager && manager.orgId === orgId) {
          managerId = manager.id;
        } else {
          result.errors.push(`Row ${index + 2}: Manager with email ${row.managerEmail} not found or not in org.`);
        }
      }

      let role = row.role?.toUpperCase() || 'USER';
      if (!['USER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
        role = 'USER';
      }

      const user = await prisma.user.create({
        data: {
          name: row.name,
          email: row.email,
          passwordHash,
          orgId,
          role,
          managerId,
          avatarUrl: `https://i.pravatar.cc/150?u=${row.email}`,
        },
      });
      result.created++;
    } catch (error: any) {
      result.errors.push(`Row ${index + 2}: ${error.message}`);
      result.skipped++;
    }
  }

  return result;
}
