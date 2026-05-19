import prisma from '../lib/prisma';
import { createAuditLog } from '../utils/utils';

export async function listOrgUsers(orgId: string) {
  return await prisma.user.findMany({
    where: { orgId },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      avatarUrl: true, 
      role: true,
      manager: { select: { id: true, name: true } },
      reports: { select: { id: true, name: true } }
    },
    orderBy: { name: 'asc' },
  });
}

export async function updateUserRole(id: string, role: string, orgId: string, performedBy: string) {
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.orgId !== orgId) throw new Error('User not found');

  // Prevent self-demotion from SUPER_ADMIN
  if (id === performedBy && targetUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('SUPER_ADMIN cannot demote themselves. Transfer role first.');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { role: role as any },
    select: { id: true, name: true, email: true, role: true }
  });

  await createAuditLog(prisma, {
    entityType: 'User',
    entityId: id,
    action: 'UPDATE_ROLE',
    performedBy,
    oldValues: { role: targetUser.role } as any,
    newValues: { role: updatedUser.role } as any
  });

  return updatedUser;
}

export async function getUser(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: { organization: true }
  });
}

export async function updateUserManager(id: string, managerId: string | null, orgId: string, performedBy: string) {
  const targetUser = await prisma.user.findUnique({ where: { id } });
  if (!targetUser || targetUser.orgId !== orgId) throw new Error('User not found');

  if (managerId) {
    if (managerId === id) throw new Error('A user cannot be their own manager');
    const manager = await prisma.user.findUnique({ where: { id: managerId } });
    if (!manager || manager.orgId !== orgId) throw new Error('Manager not found in this organization');
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { managerId },
    select: { id: true, name: true, email: true, managerId: true }
  });

  await createAuditLog(prisma, {
    entityType: 'User',
    entityId: id,
    action: 'UPDATE_MANAGER',
    performedBy,
    oldValues: { managerId: targetUser.managerId } as any,
    newValues: { managerId: updatedUser.managerId } as any
  });

  return updatedUser;
}
