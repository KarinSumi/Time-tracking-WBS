import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.create({
    data: { name: 'Aion Enterprise' }
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin2@aion.local',
      name: 'Admin User',
      passwordHash,
      role: 'SUPER_ADMIN',
      orgId: org.id
    }
  });

  // Create some dummy data for Resource Intelligence to show
  const project = await prisma.project.create({
    data: {
      name: 'Aion Development',
      orgId: org.id
    }
  });

  const phase = await prisma.phase.create({
    data: {
      name: 'Phase 1: Alpha',
      orgId: org.id
    }
  });

  await prisma.plannedTask.create({
    data: {
      taskDescription: 'Implement Core UI',
      startDate: new Date('2026-05-01'),
      endDate: new Date('2026-05-31'),
      plannedHours: 120,
      projectId: project.id,
      phaseId: phase.id,
      assigneeId: user.id,
      assignedById: user.id
    }
  });

  console.log(`Created admin user: ${user.email} and dummy data`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
