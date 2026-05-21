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

  // Verify that project belongs to context.orgId
  if (data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId }
    });
    if (!project || project.orgId !== context.orgId) {
      throw new Error('Unauthorized');
    }
  }

  // Verify that phase belongs to context.orgId
  if (data.phaseId) {
    const phase = await prisma.phase.findUnique({
      where: { id: data.phaseId }
    });
    if (!phase || phase.orgId !== context.orgId) {
      throw new Error('Unauthorized');
    }
  }

  // Verify assignee belongs to context.orgId
  if (data.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: data.assigneeId }
    });
    if (!assignee || assignee.orgId !== context.orgId) {
      throw new Error('Unauthorized');
    }
  }

  // Verify parentTask assignee belongs to context.orgId
  if (data.parentId) {
    const parentTask = await prisma.plannedTask.findUnique({
      where: { id: data.parentId }
    });
    if (!parentTask) {
      throw new Error('Unauthorized');
    }
    const assigneeOfParent = await prisma.user.findUnique({
      where: { id: parentTask.assigneeId }
    });
    if (!assigneeOfParent || assigneeOfParent.orgId !== context.orgId) {
      throw new Error('Unauthorized');
    }
  }

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
    // Pre-fetch active organization entities for validation/resolving
    const users = await tx.user.findMany({
      where: { orgId: context.orgId }
    });
    const projects = await tx.project.findMany({
      where: { orgId: context.orgId }
    });
    const phases = await tx.phase.findMany({
      where: { orgId: context.orgId }
    });

    const userMap = new Map(users.map(u => [u.email.toLowerCase(), u.id]));
    const projectMap = new Map(projects.map(p => [p.name.toLowerCase(), p.id]));
    const phaseMap = new Map(phases.map(ph => [ph.name.toLowerCase(), ph.id]));

    const created = [];
    for (const row of plans) {
      const assigneeEmail = (row['Assignee Email'] || row['assigneeEmail'] || row['assignee_email'] || '').trim().toLowerCase();
      const projectName = (row['Project'] || row['project'] || '').trim().toLowerCase();
      const phaseName = (row['Phase'] || row['phase'] || '').trim().toLowerCase();
      const taskDescription = row['Task Description'] || row['taskDescription'] || row['description'] || '';
      const plannedHoursRaw = row['Planned Hours'] || row['plannedHours'] || row['hours'] || 0;
      const dateRaw = row['Date'] || row['date'] || null;

      if (!assigneeEmail || !taskDescription) {
        throw new Error('Assignee Email and Task Description are required');
      }

      const assigneeId = userMap.get(assigneeEmail);
      if (!assigneeId) {
        throw new Error(`User with email ${assigneeEmail} not found in this organization`);
      }

      const projectId = projectName ? projectMap.get(projectName) : null;
      if (projectName && !projectId) {
        throw new Error(`Project "${row['Project']}" not found in this organization`);
      }

      const phaseId = phaseName ? phaseMap.get(phaseName) : null;
      if (phaseName && !phaseId) {
        throw new Error(`Phase "${row['Phase']}" not found in this organization`);
      }

      const date = dateRaw ? new Date(dateRaw) : new Date();
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateRaw}`);
      }

      const plan = await tx.plannedTask.create({
        data: {
          assigneeId,
          assignedById: context.userId,
          projectId: projectId || null,
          phaseId: phaseId || null,
          taskDescription,
          plannedHours: Number(plannedHoursRaw),
          startDate: date,
          endDate: date,
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
