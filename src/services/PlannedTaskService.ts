import prisma from '../lib/prisma';
import { UserContext } from './TimeEntryService';
import { createAuditLog } from '../utils/utils';

export async function listPlans(orgId: string) {
  return await prisma.plannedTask.findMany({
    where: { project: { orgId } },
    include: {
      project: { select: { name: true } },
      phase: { select: { name: true } },
      assignee: { select: { name: true, avatarUrl: true } },
      _count: { select: { timeEntries: true } }
    },
    orderBy: { startDate: 'asc' }
  });
}

export async function createPlan(data: any, context: UserContext) {
  if (context.role === 'USER') throw new Error('Unauthorized');

  const plan = await prisma.plannedTask.create({
    data: {
      ...data,
      assignedById: context.userId,
      plannedHours: Number(data.plannedHours),
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined
    }
  });

  await createAuditLog(prisma, {
    entityType: 'PlannedTask',
    entityId: plan.id,
    action: 'CREATE',
    performedBy: context.userId,
    newValues: data as any
  });

  return plan;
}

export async function updatePlan(id: string, data: any, context: UserContext) {
  if (context.role === 'USER') throw new Error('Unauthorized');

  const oldPlan = await prisma.plannedTask.findUnique({ 
    where: { id },
    include: { project: { select: { orgId: true } } }
  });
  if (!oldPlan || oldPlan.project?.orgId !== context.orgId) throw new Error('Plan not found');

  const plan = await prisma.plannedTask.update({
    where: { id },
    data: {
      ...data,
      plannedHours: data.plannedHours !== undefined ? Number(data.plannedHours) : undefined
    }
  });

  await createAuditLog(prisma, {
    entityType: 'PlannedTask',
    entityId: id,
    action: 'UPDATE',
    performedBy: context.userId,
    oldValues: oldPlan as any,
    newValues: plan as any
  });

  return plan;
}

export async function deletePlan(id: string, context: UserContext) {
  if (context.role === 'USER') throw new Error('Unauthorized');

  const plan = await prisma.plannedTask.findUnique({ 
    where: { id },
    include: { project: { select: { orgId: true } } }
  });
  if (!plan || plan.project?.orgId !== context.orgId) throw new Error('Plan not found');

  await prisma.plannedTask.delete({ where: { id } });

  await createAuditLog(prisma, {
    entityType: 'PlannedTask',
    entityId: id,
    action: 'DELETE',
    performedBy: context.userId,
    oldValues: plan as any
  });
}

export async function uploadPlans(plans: any[], context: UserContext) {
  if (context.role === 'USER') throw new Error('Unauthorized');

  return await prisma.$transaction(async (tx) => {
    const created = [];
    for (const data of plans) {
      const plan = await tx.plannedTask.create({
        data: {
          ...data,
          plannedHours: Number(data.plannedHours)
        }
      });
      created.push(plan);
    }

    await createAuditLog(tx, {
      entityType: 'PlannedTask',
      entityId: 'BULK',
      action: 'CREATE',
      performedBy: context.userId,
      newValues: { count: created.length } as any
    });

    return created;
  });
}

export async function getWbsTasks(projectId: string, orgId: string) {
  return await prisma.plannedTask.findMany({
    where: { 
      projectId,
      assignee: { orgId }
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      phase: { select: { id: true, name: true } },
    },
    orderBy: [
      { wbsId: 'asc' },
      { startDate: 'asc' }
    ]
  });
}
