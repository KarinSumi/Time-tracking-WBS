import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding WBS Data ---');

  const orgId = 'org-001';
  const superAdminId = 'usr-super';

  // 1. Create a Project
  const project = await prisma.project.create({
    data: {
      name: 'Solaris Infrastructure Upgrade',
      color: '#3b82f6',
      orgId
    }
  });

  // 2. Create Phases
  const phase1 = await prisma.phase.create({ data: { name: 'Planning & Architecture', orgId } });
  const phase2 = await prisma.phase.create({ data: { name: 'Development & Integration', orgId } });
  const phase3 = await prisma.phase.create({ data: { name: 'Testing & QA', orgId } });

  const tasks = [
    // Phase 1
    { wbsId: '1', taskDescription: 'Phase 1: Planning', startDate: '2026-06-01', endDate: '2026-06-15', plannedHours: 40, projectId: project.id, phaseId: phase1.id, progressPercentage: 100 },
    { wbsId: '1.1', taskDescription: 'Requirements Gathering', startDate: '2026-06-01', endDate: '2026-06-05', plannedHours: 20, projectId: project.id, phaseId: phase1.id, progressPercentage: 100, parentWbsId: '1' },
    { wbsId: '1.2', taskDescription: 'System Architecture Design', startDate: '2026-06-06', endDate: '2026-06-15', plannedHours: 40, projectId: project.id, phaseId: phase1.id, progressPercentage: 80, parentWbsId: '1' },
    
    // Phase 2
    { wbsId: '2', taskDescription: 'Phase 2: Development', startDate: '2026-06-16', endDate: '2026-07-15', plannedHours: 120, projectId: project.id, phaseId: phase2.id, progressPercentage: 20 },
    { wbsId: '2.1', taskDescription: 'Core Backend Development', startDate: '2026-06-16', endDate: '2026-06-30', plannedHours: 60, projectId: project.id, phaseId: phase2.id, progressPercentage: 40, parentWbsId: '2' },
    { wbsId: '2.2', taskDescription: 'Frontend Interface Design', startDate: '2026-07-01', endDate: '2026-07-15', plannedHours: 60, projectId: project.id, phaseId: phase2.id, progressPercentage: 0, parentWbsId: '2' },
    { wbsId: '2.2.1', taskDescription: 'Mobile Responsiveness', startDate: '2026-07-01', endDate: '2026-07-07', plannedHours: 30, projectId: project.id, phaseId: phase2.id, progressPercentage: 0, parentWbsId: '2.2' },
    { wbsId: '2.2.2', taskDescription: 'Accessibility Audit', startDate: '2026-07-08', endDate: '2026-07-15', plannedHours: 30, projectId: project.id, phaseId: phase2.id, progressPercentage: 0, parentWbsId: '2.2' },

    // Phase 3
    { wbsId: '3', taskDescription: 'Phase 3: Testing & Deployment', startDate: '2026-07-16', endDate: '2026-07-31', plannedHours: 40, projectId: project.id, phaseId: phase3.id, progressPercentage: 0 },
    { wbsId: '3.1', taskDescription: 'Unit Testing', startDate: '2026-07-16', endDate: '2026-07-25', plannedHours: 30, projectId: project.id, phaseId: phase3.id, progressPercentage: 0, parentWbsId: '3' },
    { wbsId: '3.2', taskDescription: 'UAT & Handover', startDate: '2026-07-26', endDate: '2026-07-31', plannedHours: 10, projectId: project.id, phaseId: phase3.id, progressPercentage: 0, parentWbsId: '3' },
  ];

  const idMap: Record<string, string> = {};

  for (const t of tasks) {
    const parentId: string | null = t.parentWbsId ? (idMap[t.parentWbsId] || null) : null;
    
    const created = await prisma.plannedTask.create({
      data: {
        wbsId: t.wbsId,
        taskDescription: t.taskDescription,
        startDate: new Date(t.startDate),
        endDate: new Date(t.endDate),
        plannedHours: t.plannedHours,
        progressPercentage: t.progressPercentage,
        status: t.progressPercentage === 100 ? 'COMPLETED' : t.progressPercentage > 0 ? 'IN_PROGRESS' : 'PENDING',
        projectId: t.projectId,
        phaseId: t.phaseId,
        assigneeId: superAdminId,
        assignedById: superAdminId,
        parentId: parentId || null
      }
    });
    
    idMap[t.wbsId] = created.id;
    console.log(`Created Task ${t.wbsId}: ${t.taskDescription}`);
  }

  console.log('--- Seed Complete ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
