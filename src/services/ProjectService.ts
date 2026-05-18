import prisma from '../lib/prisma';
import { UserContext } from './TimeEntryService';
import { createAuditLog } from '../utils/utils';

export async function listProjects(orgId: string) {
  return await prisma.project.findMany({
    where: { orgId },
    include: {
      _count: { select: { timeEntries: true } }
    },
    orderBy: { name: 'asc' }
  });
}

export async function getProject(id: string, orgId: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      timeEntries: {
        include: { user: { select: { name: true } } },
        orderBy: { date: 'desc' },
        take: 50
      }
    }
  });

  if (!project || project.orgId !== orgId) throw new Error('Project not found');
  return project;
}

export async function createProject(data: any, context: UserContext) {
  if (context.role === 'USER') throw new Error('Unauthorized');

  const project = await prisma.project.create({
    data: {
      ...data,
      orgId: context.orgId
    }
  });

  await createAuditLog(prisma, {
    entityType: 'Project',
    entityId: project.id,
    action: 'CREATE',
    performedBy: context.userId,
    newValues: data as any
  });

  return project;
}

export async function updateProject(id: string, data: any, context: UserContext) {
  if (context.role === 'USER') throw new Error('Unauthorized');

  const oldProject = await prisma.project.findUnique({ where: { id } });
  if (!oldProject || oldProject.orgId !== context.orgId) throw new Error('Project not found');

  const project = await prisma.project.update({
    where: { id },
    data
  });

  await createAuditLog(prisma, {
    entityType: 'Project',
    entityId: id,
    action: 'UPDATE',
    performedBy: context.userId,
    oldValues: oldProject as any,
    newValues: project as any
  });

  return project;
}

export async function deleteProject(id: string, context: UserContext) {
  if (context.role !== 'SUPER_ADMIN') throw new Error('Only Super Admins can delete projects');

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.orgId !== context.orgId) throw new Error('Project not found');

  await prisma.project.delete({ where: { id } });

  await createAuditLog(prisma, {
    entityType: 'Project',
    entityId: id,
    action: 'DELETE',
    performedBy: context.userId,
    oldValues: project as any
  });
}

export async function getProjectStats(projectId: string, orgId: string) {
  const [project, plans, entries, phases] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.plannedTask.findMany({ where: { projectId } }),
    prisma.timeEntry.findMany({ where: { projectId, status: 'SUBMITTED' } }),
    prisma.phase.findMany({ where: { orgId } })
  ]);

  if (!project || project.orgId !== orgId) throw new Error('Project not found');

  const totalPlanned = plans.reduce((acc, p) => acc + Number(p.plannedHours), 0);
  const totalActual = entries.reduce((acc, e) => acc + Number(e.hours), 0);

  return {
    totalPlanned,
    totalActual,
    progress: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
    phaseStats: phases.map(ph => ({
      id: ph.id,
      name: ph.name,
      planned: plans.filter(p => p.phaseId === ph.id).reduce((acc, p) => acc + Number(p.plannedHours), 0),
      actual: entries.filter(e => e.phaseId === ph.id).reduce((acc, e) => acc + Number(e.hours), 0)
    }))
  };
}
