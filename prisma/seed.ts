import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Multi-Tenant Seed ---');

  // Clear existing data (Caution: Only for dev/test)
  await prisma.auditLog.deleteMany({});
  await prisma.timeEntry.deleteMany({});
  await prisma.plannedTask.deleteMany({});
  await prisma.holiday.deleteMany({});
  await prisma.phase.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  const hash = await bcrypt.hash('password123', 10);

  // --- ORG 1: Stitch & Co ---
  const org1 = await prisma.organization.create({
    data: { id: 'org-001', name: 'Stitch & Co' }
  });

  const stitchUsers = [
    { id: 'usr-stitch-admin', email: 'admin@stitch.com', name: 'John Stitch', role: 'ADMIN' as const },
    { id: 'usr-stitch-alice', email: 'alice@stitch.com', name: 'Alice Frontend', role: 'USER' as const },
    { id: 'usr-stitch-bob', email: 'bob@stitch.com', name: 'Bob Backend', role: 'USER' as const },
  ];

  for (const u of stitchUsers) {
    await prisma.user.create({
      data: {
        ...u,
        passwordHash: hash,
        orgId: org1.id,
        avatarUrl: `https://i.pravatar.cc/150?u=${u.email}`
      }
    });
  }

  const stitchProjects = [
    { id: 'prj-stitch-1', name: 'Stitch Dashboard', color: '#3b82f6', orgId: org1.id },
    { id: 'prj-stitch-2', name: 'Enterprise API', color: '#8b5cf6', orgId: org1.id },
  ];
  for (const p of stitchProjects) await prisma.project.create({ data: p });

  const stitchPhases = ['Discovery', 'Build', 'QA'].map((name, i) => ({
    id: `phase-stitch-${i}`, name, sortOrder: i, orgId: org1.id
  }));
  for (const ph of stitchPhases) await prisma.phase.create({ data: ph });

  await prisma.holiday.create({
    data: { date: new Date('2026-12-25'), description: 'Stitch Xmas', orgId: org1.id }
  });

  // --- ORG 2: Velocity Labs ---
  const org2 = await prisma.organization.create({
    data: { id: 'org-002', name: 'Velocity Labs' }
  });

  const velocityUsers = [
    { id: 'usr-vel-admin', email: 'admin@velocity.com', name: 'Victor Velocity', role: 'ADMIN' as const },
    { id: 'usr-vel-charlie', email: 'charlie@velocity.com', name: 'Charlie Designer', role: 'USER' as const },
  ];

  for (const u of velocityUsers) {
    await prisma.user.create({
      data: {
        ...u,
        passwordHash: hash,
        orgId: org2.id,
        avatarUrl: `https://i.pravatar.cc/150?u=${u.email}`
      }
    });
  }

  const velocityProjects = [
    { id: 'prj-vel-1', name: 'Rocket Propulsion', color: '#ef4444', orgId: org2.id },
  ];
  for (const p of velocityProjects) await prisma.project.create({ data: p });

  // --- SUPER ADMIN ---
  await prisma.user.create({
    data: {
      id: 'usr-super',
      email: 'superadmin@example.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      passwordHash: hash,
      orgId: org1.id, // Super admin can belong to any org, but usually the first one
      avatarUrl: 'https://i.pravatar.cc/150?u=superadmin@example.com'
    }
  });

  console.log('✅ Created Organizations, Users, Projects, and Phases');

  // --- WBS SEEDING (Hierarchical) ---
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  // Stitch & Co - Project 1
  const rootTask = await prisma.plannedTask.create({
    data: {
      wbsId: '1.0',
      taskDescription: 'Project Foundation',
      plannedHours: 100,
      startDate: today,
      endDate: nextMonth,
      projectId: 'prj-stitch-1',
      assigneeId: 'usr-stitch-alice',
      assignedById: 'usr-stitch-admin',
      status: 'IN_PROGRESS'
    }
  });

  await prisma.plannedTask.create({
    data: {
      wbsId: '1.1',
      taskDescription: 'UI Components',
      plannedHours: 40,
      startDate: today,
      endDate: new Date(today.getTime() + 7 * 86400000),
      projectId: 'prj-stitch-1',
      phaseId: 'phase-stitch-1',
      parentId: rootTask.id,
      assigneeId: 'usr-stitch-alice',
      assignedById: 'usr-stitch-admin',
      status: 'IN_PROGRESS'
    }
  });

  // Velocity Labs - Project 1
  await prisma.plannedTask.create({
    data: {
      wbsId: '1.0',
      taskDescription: 'Secret Rocket Plan',
      plannedHours: 500,
      startDate: today,
      endDate: nextMonth,
      projectId: 'prj-vel-1',
      assigneeId: 'usr-vel-charlie',
      assignedById: 'usr-vel-admin',
      status: 'PENDING'
    }
  });

  console.log('✅ Seeded Hierarchical WBS for both Orgs');

  // --- MOCK TIME ENTRIES ---
  const mockEntries = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    // Stitch Entries
    mockEntries.push({
      userId: 'usr-stitch-alice',
      date: d,
      hours: 8,
      taskDescription: 'Building stitch dashboard',
      projectId: 'prj-stitch-1',
      phaseId: 'phase-stitch-1',
      status: 'SUBMITTED' as const
    });

    // Velocity Entries
    mockEntries.push({
      userId: 'usr-vel-charlie',
      date: d,
      hours: 4,
      taskDescription: 'Designing rockets',
      projectId: 'prj-vel-1',
      status: 'SUBMITTED' as const
    });
  }

  await prisma.timeEntry.createMany({ data: mockEntries });
  console.log(`✅ Seeded ${mockEntries.length} time entries across organizations`);

  console.log('--- Multi-Tenant Seed Complete ---');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
