import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testGanttUpdate() {
  console.log('Testing Gantt Date Update API...');
  const plan = await prisma.plannedTask.findFirst();
  if (!plan) return console.log('No plan found to test.');

  const newStart = new Date(plan.startDate);
  newStart.setDate(newStart.getDate() + 1);
  const newEnd = new Date(plan.endDate);
  newEnd.setDate(newEnd.getDate() + 1);

  // In real test we would use fetch, but here we can check the logic via direct Prisma or a curl in another step.
  console.log(`Plan ${plan.id}: Current [${plan.startDate.toISOString()} - ${plan.endDate.toISOString()}]`);
  console.log(`Suggested: [${newStart.toISOString()} - ${newEnd.toISOString()}]`);
}

async function testMultiDay() {
  console.log('Testing Multi-Day Logic (Simulation)...');
  const user = await prisma.user.findFirst();
  if (!user) return;
  
  // Simulation of loop logic
  const start = new Date('2026-05-18'); // Monday
  const end = new Date('2026-05-22');   // Friday
  console.log(`Range: ${start.toDateString()} to ${end.toDateString()}`);
}

testGanttUpdate().then(testMultiDay).finally(() => prisma.$disconnect());
