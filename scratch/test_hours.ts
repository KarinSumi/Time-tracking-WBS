import { calculateAvailableWorkingHours } from '../src/utils/hours';
import { Holiday } from '@prisma/client';

async function test() {
  console.log('--- Testing calculateAvailableWorkingHours ---');
  
  const h1: Holiday = { id: 'h1', date: new Date('2026-05-20'), description: 'Test Holiday', orgId: 'org1' };
  
  const cases = [
    {
      name: 'TC1: Mon-Fri (no holidays)',
      start: new Date('2026-05-18'), // Mon
      end: new Date('2026-05-22'),   // Fri
      holidays: [],
      expected: 40
    },
    {
      name: 'TC2: Fri-Mon (weekend exclusion)',
      start: new Date('2026-05-22'), // Fri
      end: new Date('2026-05-25'),   // Mon
      holidays: [],
      expected: 16 // Fri and Mon
    },
    {
      name: 'TC3: Mon-Wed (one holiday)',
      start: new Date('2026-05-18'), // Mon
      end: new Date('2026-05-20'),   // Wed
      holidays: [h1], // Wed is holiday
      expected: 16 // Mon and Tue
    }
  ];

  for (const c of cases) {
    const result = calculateAvailableWorkingHours(c.start, c.end, c.holidays);
    if (result === c.expected) {
      console.log(`✅ ${c.name} passed`);
    } else {
      console.error(`❌ ${c.name} failed: expected ${c.expected}, got ${result}`);
    }
  }
}

test().catch(console.error);
