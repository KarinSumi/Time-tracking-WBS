import prisma from '../lib/prisma';
import { entryCache } from '../utils/cache';
import { TimeEntry } from '@prisma/client';
import { createAuditLog } from '../utils/utils';

export interface UserContext {
  userId: string;
  orgId: string;
  role: string;
}

export async function listEntries(filters: any, context: UserContext) {
  // Pagination defaults
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 50;
  const skip = (page - 1) * limit;

  // Build cache key based on user and filters (excluding pagination params)
  const cacheKey = `listEntries:${context.role}:${context.userId || ''}:${context.orgId || ''}:${JSON.stringify({
    status: filters.status,
    projectId: filters.projectId,
    userId: filters.userId,
    startDate: filters.startDate,
    endDate: filters.endDate,
  })}`;

  // Attempt to retrieve from cache
  const cached = entryCache.get(cacheKey);
  if (cached) {
    // Return the appropriate slice for pagination
    return cached.slice(skip, skip + limit);
  }

  const where: any = {};

  if (context.role === 'USER') {
    where.userId = context.userId;
  } else {
    where.user = { orgId: context.orgId };
    if (filters.userId) where.userId = filters.userId;
  }

  if (filters.status) where.status = filters.status;
  if (filters.projectId) where.projectId = filters.projectId;

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }

  const entries = await prisma.timeEntry.findMany({
    where,
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
      project: { select: { id: true, name: true, color: true } },
      phase: { select: { id: true, name: true } },
    },
    orderBy: { date: 'desc' },
  });

  // Store full result set in cache
  entryCache.set(cacheKey, entries);

  // Return paginated slice
  return entries.slice(skip, skip + limit);
}

export async function createEntry(data: any, userId: string) {
  const entry = await prisma.timeEntry.create({
    data: {
      ...data,
      userId,
      date: data.date ? new Date(data.date) : new Date(),
      hours: Number(data.hours),
      status: 'DRAFT',
    },
    include: {
      user: { select: { name: true, avatarUrl: true } },
      project: { select: { id: true, name: true, color: true } },
      phase: { select: { id: true, name: true } },
    },
  });

  await createAuditLog(prisma, {
    entityType: 'TimeEntry',
    entityId: entry.id,
    action: 'CREATE',
    performedBy: userId,
    newValues: data as any,
  });

  return entry;
}

export async function updateTimeEntry(id: string, data: any, context: UserContext) {
  return await prisma.$transaction(async (tx) => {
    const oldEntry = await tx.timeEntry.findUnique({ 
      where: { id },
      include: { user: { select: { orgId: true } } }
    });
    
    if (!oldEntry) throw new Error('Time entry not found');

    const isOwner = oldEntry.userId === context.userId;
    const isOrgAdmin = (context.role === 'ADMIN' || context.role === 'SUPER_ADMIN') && oldEntry.user.orgId === context.orgId;

    if (!isOwner && !isOrgAdmin) throw new Error('Unauthorized');
    if (oldEntry.status !== 'DRAFT' && !isOrgAdmin) throw new Error('Cannot edit non-draft entry');

    const newEntry = await tx.timeEntry.update({
      where: { id },
      data,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        project: { select: { id: true, name: true, color: true } },
        phase: { select: { id: true, name: true } },
      },
    });

    await createAuditLog(tx, {
      entityType: 'TimeEntry',
      entityId: id,
      action: 'UPDATE',
      performedBy: context.userId,
      oldValues: oldEntry as any,
      newValues: newEntry as any,
    });

    return newEntry;
  });
}

export async function deleteTimeEntry(id: string, context: UserContext) {
  return await prisma.$transaction(async (tx) => {
    const entry = await tx.timeEntry.findUnique({ 
      where: { id },
      include: { user: { select: { orgId: true } } }
    });

    if (!entry) throw new Error('Entry not found');

    const isOwner = entry.userId === context.userId;
    const isOrgAdmin = (context.role === 'ADMIN' || context.role === 'SUPER_ADMIN') && entry.user.orgId === context.orgId;

    if (!isOwner && !isOrgAdmin) throw new Error('Unauthorized');
    if (entry.status === 'SUBMITTED' && !isOrgAdmin) throw new Error('Cannot delete submitted entry');

    await tx.timeEntry.delete({ where: { id } });

    await createAuditLog(tx, {
      entityType: 'TimeEntry',
      entityId: id,
      action: 'DELETE',
      performedBy: context.userId,
      oldValues: entry as any,
    });
  });
}

export async function getDraftCount(userId: string) {
  return await prisma.timeEntry.count({
    where: { userId, status: 'DRAFT' }
  });
}

export async function createMultiDayEntries(data: any, userId: string) {
  const { 
    plannedTaskId, projectId, phaseId, startDate, endDate, 
    hoursPerDay, taskDescription, excludeWeekends 
  } = data;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { orgId: true } });
  if (!user) throw new Error('User not found');

  const holidays = await prisma.holiday.findMany({ 
    where: { orgId: user.orgId },
    select: { date: true }
  });
  const holidayDates = new Set(holidays.map(h => h.date.toISOString().split('T')[0]));

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (start > end) throw new Error('startDate must be before or equal to endDate');

  const { eachDayOfInterval, isWeekend } = await import('date-fns');
  const days = eachDayOfInterval({ start, end });

  return await prisma.$transaction(async (tx) => {
    const results = [];
    for (const day of days) {
      const dateStr = day.toISOString().split('T')[0];
      if (excludeWeekends && isWeekend(day)) continue;
      if (holidayDates.has(dateStr)) continue;

      const entry = await tx.timeEntry.create({
        data: {
          hours: Number(hoursPerDay),
          taskDescription,
          userId,
          date: day,
          status: 'SUBMITTED', 
          projectId: projectId || null,
          phaseId: phaseId || null,
          plannedTaskId: plannedTaskId || null,
        }
      });

      await createAuditLog(tx, {
        entityType: 'TimeEntry',
        entityId: entry.id,
        action: 'CREATE',
        performedBy: userId,
        newValues: { hours: hoursPerDay, taskDescription, date: day, multiDay: true } as any,
      });

      results.push(entry);
    }
    return results;
  });
}

export async function createBulkEntries(entries: any[], userId: string) {
  return await prisma.$transaction(async (tx) => {
    const createdEntries = [];
    for (const data of entries) {
      const { hours, taskDescription, date, projectId, phaseId, plannedTaskId } = data;
      
      if (!taskDescription || !hours) throw new Error('Task description and hours are required for all entries');

      const entry = await tx.timeEntry.create({
        data: {
          hours: Number(hours),
          taskDescription,
          userId,
          date: date ? new Date(date) : new Date(),
          status: 'SUBMITTED', 
          projectId: projectId || null,
          phaseId: phaseId || null,
          plannedTaskId: plannedTaskId || null,
        },
      });

      await createAuditLog(tx, {
        entityType: 'TimeEntry',
        entityId: entry.id,
        action: 'CREATE',
        performedBy: userId,
        newValues: data as any,
      });

      if (plannedTaskId) {
        await tx.plannedTask.updateMany({
          where: { id: plannedTaskId, status: 'PENDING' },
          data: { status: 'IN_PROGRESS' }
        });
      }

      createdEntries.push(entry);
    }
    return createdEntries;
  });
}

export async function updateBulkStatus(ids: string[], status: string, context: UserContext) {
  return await prisma.$transaction(async (tx) => {
    const entries = await tx.timeEntry.findMany({
      where: { id: { in: ids } },
      include: { user: { select: { orgId: true } } }
    });

    const validIds = entries
      .filter(e => {
        const isOwner = e.userId === context.userId;
        const isOrgAdmin = (context.role === 'ADMIN' || context.role === 'SUPER_ADMIN') && e.user.orgId === context.orgId;
        return isOwner || isOrgAdmin;
      })
      .map(e => e.id);

    if (validIds.length === 0) throw new Error('No valid entries found to update');

    const result = await tx.timeEntry.updateMany({
      where: { id: { in: validIds } },
      data: { status: status as any }
    });

    await createAuditLog(tx, {
      entityType: 'TimeEntry',
      entityId: 'BULK',
      action: 'UPDATE',
      performedBy: context.userId,
      newValues: { ids: validIds, status } as any,
    });

    return result;
  });
}
