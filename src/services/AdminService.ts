import prisma from '../lib/prisma';
import { UserContext } from './TimeEntryService';
import { createAuditLog } from '../utils/utils';

export async function listAdminEntries(filters: any, orgId: string) {
  const { userId, projectId, startDate, endDate } = filters;
  
  const whereClause: any = {
    user: { orgId }
  };
  if (userId) whereClause.userId = userId;
  if (projectId) whereClause.projectId = projectId;
  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.date.lte = end;
    }
  }

  return await prisma.timeEntry.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, email: true, avatarUrl: true } },
      project: { select: { id: true, name: true, color: true } },
      phase: { select: { id: true, name: true } },
    },
    orderBy: { date: 'desc' },
    take: 200, 
  });
}

export async function createAdminEntry(data: any, context: UserContext) {
  const { userId, ...entryData } = data;

  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser || targetUser.orgId !== context.orgId) throw new Error('Target user not found');

  const entry = await prisma.timeEntry.create({
    data: {
      ...entryData,
      userId,
      date: entryData.date ? new Date(entryData.date) : new Date(),
      status: 'SUBMITTED',
    },
    include: {
      user: { select: { name: true, email: true, avatarUrl: true } },
      project: { select: { id: true, name: true, color: true } },
      phase: { select: { id: true, name: true } },
    },
  });

  await createAuditLog(prisma, {
    entityType: 'TimeEntry',
    entityId: entry.id,
    action: 'CREATE_ADMIN',
    performedBy: context.userId,
    newValues: data as any
  });

  return entry;
}

export async function getAuditLogs(orgId: string) {
  return await prisma.auditLog.findMany({
    where: { user: { orgId } },
    include: {
      user: { select: { name: true, email: true, avatarUrl: true } }
    },
    orderBy: { timestamp: 'desc' },
    take: 500
  });
}

export async function uploadAdminEntries(entries: any[], context: UserContext) {
  return await prisma.$transaction(async (tx) => {
    const created = [];
    for (const data of entries) {
      const entry = await tx.timeEntry.create({
        data: {
          ...data,
          status: 'SUBMITTED'
        }
      });
      created.push(entry);
    }
    
    await createAuditLog(tx, {
      entityType: 'TimeEntry',
      entityId: 'BULK_ADMIN',
      action: 'UPLOAD',
      performedBy: context.userId,
      newValues: { count: created.length } as any
    });

    return created;
  });
}
