import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken } from '../middleware/auth';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: true },
  });

  if (!user) throw new Error('Invalid email or password');

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) throw new Error('Invalid email or password');

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

export async function register(name: string, email: string, password: string, orgName?: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('An account with this email already exists');

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
