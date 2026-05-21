import prisma from '../lib/prisma';

export async function suggestNextTask(orgId: string, userId: string) {
  const now = new Date();
  
  // Find a planned task assigned to the user that is currently open
  const activePlan = await prisma.plannedTask.findFirst({
    where: {
      assigneeId: userId,
      status: { not: 'COMPLETED' },
      startDate: { lte: now },
      endDate: { gte: now }
    },
    include: {
      project: true,
      phase: true
    },
    orderBy: {
      endDate: 'asc'
    }
  });

  if (activePlan) {
    return {
      type: 'PLAN',
      plannedTaskId: activePlan.id,
      projectId: activePlan.projectId,
      phaseId: activePlan.phaseId,
      projectName: activePlan.project?.name || 'General',
      phaseName: activePlan.phase?.name || 'Development',
      taskDescription: activePlan.taskDescription,
      title: activePlan.taskDescription,
      description: `Based on your assigned plan ending ${new Date(activePlan.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
      hoursLeft: Number(activePlan.plannedHours)
    };
  }

  // Fallback 1: Any pending/incomplete assigned planned task
  const futurePlan = await prisma.plannedTask.findFirst({
    where: {
      assigneeId: userId,
      status: { not: 'COMPLETED' }
    },
    include: {
      project: true,
      phase: true
    },
    orderBy: {
      startDate: 'asc'
    }
  });

  if (futurePlan) {
    return {
      type: 'PLAN',
      plannedTaskId: futurePlan.id,
      projectId: futurePlan.projectId,
      phaseId: futurePlan.phaseId,
      projectName: futurePlan.project?.name || 'General',
      phaseName: futurePlan.phase?.name || 'Development',
      taskDescription: futurePlan.taskDescription,
      title: futurePlan.taskDescription,
      description: `Assigned task starting ${new Date(futurePlan.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
      hoursLeft: Number(futurePlan.plannedHours)
    };
  }

  // Fallback 2: Suggest work on the user's most recently used project
  const lastEntry = await prisma.timeEntry.findFirst({
    where: {
      userId
    },
    include: {
      project: true,
      phase: true
    },
    orderBy: {
      date: 'desc'
    }
  });

  if (lastEntry && lastEntry.projectId) {
    return {
      type: 'PROJECT_FALLBACK',
      plannedTaskId: null,
      projectId: lastEntry.projectId,
      phaseId: lastEntry.phaseId,
      projectName: lastEntry.project?.name || 'General',
      phaseName: lastEntry.phase?.name || 'Development',
      taskDescription: `Continue work on ${lastEntry.project?.name}`,
      title: `Continue work on ${lastEntry.project?.name}`,
      description: `Suggested based on your recent time logging history.`,
      hoursLeft: 8
    };
  }

  // Fallback 3: Check if there's any active project in the organization
  const anyProject = await prisma.project.findFirst({
    where: {
      orgId,
      status: 'ACTIVE'
    }
  });

  if (anyProject) {
    return {
      type: 'GENERAL_FALLBACK',
      plannedTaskId: null,
      projectId: anyProject.id,
      phaseId: null,
      projectName: anyProject.name,
      phaseName: 'General',
      taskDescription: `General tasks for ${anyProject.name}`,
      title: `General tasks for ${anyProject.name}`,
      description: `Suggesting tasks for active project: ${anyProject.name}.`,
      hoursLeft: 8
    };
  }

  return {
    type: 'NO_TASKS',
    plannedTaskId: null,
    projectId: null,
    phaseId: null,
    projectName: 'N/A',
    phaseName: 'N/A',
    taskDescription: 'General administrative support',
    title: 'General administrative tasks',
    description: 'No active projects or tasks assigned. Keep track of overhead work.',
    hoursLeft: 8
  };
}
