import prisma from '../lib/prisma';
import { UserContext } from './TimeEntryService';
import { createAuditLog } from '../utils/utils';

export async function listPhases(orgId: string) {
  return await prisma.phase.findMany({
    where: { orgId },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { timeEntries: true } } },
  });
}

export async function createPhase(data: any, context: UserContext) {
  if (context.role === 'USER') throw new Error('Unauthorized');

  const maxOrder = await prisma.phase.aggregate({ where: { orgId: context.orgId }, _max: { sortOrder: true } });
  const phase = await prisma.phase.create({
    data: {
      ...data,
      sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      orgId: context.orgId
    }
  });

  await createAuditLog(prisma, {
    entityType: 'Phase',
    entityId: phase.id,
    action: 'CREATE',
    performedBy: context.userId,
    newValues: data as any
  });

  return phase;
}

export async function updatePhase(id: string, data: any, context: UserContext) {
  if (context.role === 'USER') throw new Error('Unauthorized');

  const oldPhase = await prisma.phase.findUnique({ where: { id } });
  if (!oldPhase || oldPhase.orgId !== context.orgId) throw new Error('Phase not found');

  const phase = await prisma.phase.update({
    where: { id },
    data
  });

  await createAuditLog(prisma, {
    entityType: 'Phase',
    entityId: id,
    action: 'UPDATE',
    performedBy: context.userId,
    oldValues: oldPhase as any,
    newValues: phase as any
  });

  return phase;
}

export async function deletePhase(id: string, context: UserContext) {
  if (context.role === 'USER') throw new Error('Unauthorized');

  const phase = await prisma.phase.findUnique({ where: { id } });
  if (!phase || phase.orgId !== context.orgId) throw new Error('Phase not found');

  await prisma.phase.delete({ where: { id } });

  await createAuditLog(prisma, {
    entityType: 'Phase',
    entityId: id,
    action: 'DELETE',
    performedBy: context.userId,
    oldValues: phase as any
  });
}
