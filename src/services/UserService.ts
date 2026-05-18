import prisma from '../lib/prisma';
import { createAuditLog } from '../utils/utils';

export async function listOrgUsers(orgId: string) {
  return await prisma.user.findMany({
    where: { orgId },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
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
