import prisma from '../lib/prisma';
import { calculateAvailableWorkingHours } from '../utils/hours';

export async function getCapacityReport(startDate: string, endDate: string, orgId: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const [users, holidays, tasks, timeEntries] = await Promise.all([
    prisma.user.findMany({ where: { orgId }, select: { id: true, name: true } }),
    prisma.holiday.findMany({ where: { orgId } }),
    prisma.plannedTask.findMany({
      where: {
        assignee: { orgId },
        startDate: { lte: end },
        endDate: { gte: start },
      }
    }),
    prisma.timeEntry.findMany({
      where: {
        user: { orgId },
        date: { gte: start, lte: end }
      }
    })
  ]);

  const maxCapacity = calculateAvailableWorkingHours(start, end, holidays);

  return users.map(user => {
    const userTasks = tasks.filter(t => t.assigneeId === user.id);
    const userEntries = timeEntries.filter(e => e.userId === user.id);
    
    const taskBreakdown = userTasks.map(t => {
      const tStart = t.startDate > start ? t.startDate : start;
      const tEnd = t.endDate < end ? t.endDate : end;
      
      const totalTaskHours = calculateAvailableWorkingHours(t.startDate, t.endDate, holidays);
      const windowTaskHours = calculateAvailableWorkingHours(tStart, tEnd, holidays);
      
      const apportioned = totalTaskHours > 0 
        ? (windowTaskHours / totalTaskHours) * Number(t.plannedHours)
        : (windowTaskHours > 0 ? Number(t.plannedHours) : 0);

      return {
        id: t.id,
        description: t.taskDescription,
        totalPlanned: Number(t.plannedHours),
        apportionedPlanned: Math.round(apportioned * 100) / 100,
        startDate: t.startDate,
        endDate: t.endDate
      };
    });

    const totalPlanned = taskBreakdown.reduce((sum, t) => sum + t.apportionedPlanned, 0);
    const totalActual = userEntries.reduce((sum, e) => sum + Number(e.hours), 0);

    const plannedUtilization = maxCapacity > 0 ? (totalPlanned / maxCapacity) * 100 : 0;
    const actualUtilization = maxCapacity > 0 ? (totalActual / maxCapacity) * 100 : 0;

    return {
      userId: user.id,
      userName: user.name || 'Unknown User',
      maxCapacityHours: maxCapacity,
      totalPlannedHours: Math.round(totalPlanned * 10) / 10,
      totalActualHours: Math.round(totalActual * 10) / 10,
      plannedUtilization: Math.round(plannedUtilization),
      actualUtilization: Math.round(actualUtilization),
      tasks: taskBreakdown
    };
  });
}

export async function getForecastReport(orgId: string) {
  const today = new Date();
  const months = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + i + 1, 0);
    months.push({ start: d, end, label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) });
  }

  const holidays = await prisma.holiday.findMany({ where: { orgId } });
  const userCount = await prisma.user.count({ where: { orgId } });
  
  const tasks = await prisma.plannedTask.findMany({
    where: {
      assignee: { orgId },
      endDate: { gte: months[0]!.start },
      startDate: { lte: months[5]!.end }
    }
  });

  return months.map(m => {
    const monthMax = calculateAvailableWorkingHours(m.start, m.end, holidays) * userCount;
    let monthPlanned = 0;

    tasks.forEach(t => {
      const tStart = t.startDate > m.start ? t.startDate : m.start;
      const tEnd = t.endDate < m.end ? t.endDate : m.end;

      if (tStart <= tEnd) {
        const totalTaskHours = calculateAvailableWorkingHours(t.startDate, t.endDate, holidays);
        const windowTaskHours = calculateAvailableWorkingHours(tStart, tEnd, holidays);
        const apportioned = totalTaskHours > 0 
          ? (windowTaskHours / totalTaskHours) * Number(t.plannedHours)
          : 0;
        monthPlanned += apportioned;
      }
    });

    return {
      month: m.label,
      maxCapacity: monthMax,
      plannedHours: Math.round(monthPlanned),
      utilization: monthMax > 0 ? Math.round((monthPlanned / monthMax) * 100) : 0
    };
  });
}
