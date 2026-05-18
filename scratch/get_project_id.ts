import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const project = await prisma.project.findFirst({ where: { name: 'Dashboard App' } });
  console.log(project?.id);
}
main().finally(() => prisma.$disconnect());
