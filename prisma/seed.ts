import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: 'org-001' },
    update: {},
    create: { id: 'org-001', name: 'Stitch & Co' },
  });

  const hash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { passwordHash: hash },
    create: {
      id: 'usr-001', email: 'admin@example.com', name: 'John Doe',
      passwordHash: hash, orgId: org.id, role: 'ADMIN',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin@example.com',
    },
  });

  await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: { passwordHash: hash, role: 'SUPER_ADMIN' },
    create: {
      id: 'usr-super', email: 'superadmin@example.com', name: 'Super Admin',
      passwordHash: hash, orgId: org.id, role: 'SUPER_ADMIN',
      avatarUrl: 'https://i.pravatar.cc/150?u=superadmin@example.com',
    },
  });

  // Seed Projects
  const projects = [
    { name: 'Dashboard App', color: '#3b82f6' },
    { name: 'API Backend', color: '#8b5cf6' },
    { name: 'Mobile App', color: '#06b6d4' },
    { name: 'Design System', color: '#f59e0b' },
    { name: 'DevOps', color: '#22c55e' },
  ];
  for (const p of projects) {
    const existing = await prisma.project.findFirst({ where: { name: p.name, orgId: org.id } });
    if (!existing) {
      await prisma.project.create({ data: { ...p, orgId: org.id } });
    }
  }

  // Seed Phases
  const phases = ['Planning', 'Design', 'Development', 'Testing', 'Code Review', 'Deployment'];
  for (const phaseName of phases) {
    const existing = await prisma.phase.findFirst({ where: { name: phaseName, orgId: org.id } });
    if (!existing) {
      await prisma.phase.create({ data: { name: phaseName, sortOrder: phases.indexOf(phaseName), orgId: org.id } });
    }
  }

  console.log('✅ Seeded org, users, projects, phases');

  // Seed additional users
  const mockUsers = [
    { email: 'alice@example.com', name: 'Alice Frontend' },
    { email: 'bob@example.com', name: 'Bob Backend' },
    { email: 'charlie@example.com', name: 'Charlie Designer' },
  ];
  
  const userIds: string[] = [];
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  if (adminUser) userIds.push(adminUser.id);
  const superAdminUser = await prisma.user.findUnique({ where: { email: 'superadmin@example.com' } });
  if (superAdminUser) userIds.push(superAdminUser.id);
  
  for (const mu of mockUsers) {
    const existing = await prisma.user.findUnique({ where: { email: mu.email } });
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          email: mu.email, name: mu.name, orgId: org.id, passwordHash: hash,
          role: 'USER', avatarUrl: `https://i.pravatar.cc/150?u=${mu.email}`
        }
      });
      userIds.push(created.id);
    } else {
      userIds.push(existing.id);
    }
  }

  // Fetch all projects and phases to link
  const allProjects = await prisma.project.findMany();
  const allPhases = await prisma.phase.findMany();

  // Clear existing mock time entries to avoid infinite duplicates if seeded multiple times
  await prisma.timeEntry.deleteMany({});

  // Generate 2 weeks of data
  const mockEntries = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Skip weekends for some realism
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    for (const uId of userIds) {
      // Randomly decide if this day is perfect 8 hours, under 8, or over 8
      const r = Math.random();
      let totalTarget = 8.0;
      if (r < 0.2) totalTarget = 6.5; // Under-logged
      else if (r > 0.8) totalTarget = 9.5; // Over-logged

      // Split this total into 1 to 3 entries
      const numEntries = Math.floor(Math.random() * 3) + 1;
      let remaining = totalTarget;

      for (let j = 0; j < numEntries; j++) {
        const hours = j === numEntries - 1 ? remaining : Math.round((Math.random() * (remaining - 1) + 1) * 2) / 2;
        remaining -= hours;

        mockEntries.push({
          userId: uId,
          date: new Date(d.setHours(12, 0, 0, 0)),
          hours: hours,
          taskDescription: `Worked on ${['feature development', 'bug fixing', 'meetings', 'code review', 'design specs'][Math.floor(Math.random() * 5)]}`,
          projectId: allProjects[Math.floor(Math.random() * allProjects.length)]!.id,
          phaseId: allPhases[Math.floor(Math.random() * allPhases.length)]!.id,
          status: 'SUBMITTED' as any
        });
      }
    }
  }

  // Insert mock entries
  await prisma.timeEntry.createMany({
    data: mockEntries
  });

  console.log(`✅ Seeded ${mockEntries.length} mock time entries for testing the Super Admin Data Grid`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
