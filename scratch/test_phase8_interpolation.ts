import { calculateAvailableWorkingHours } from '../src/utils/hours';

const mockHolidays: any[] = []; // No holidays for simple test

function testInterpolation() {
  console.log('--- Phase 8: Interpolation Math Verification ---');
  
  // Case 1: 10-day task, 5-day window intersection
  const taskStart = new Date('2026-05-11T00:00:00Z');
  const taskEnd = new Date('2026-05-22T00:00:00Z'); // 2 full weeks
  const plannedHours = 80;

  const reportStart = new Date('2026-05-11T00:00:00Z');
  const reportEnd = new Date('2026-05-15T00:00:00Z'); // First week only

  const totalTaskHours = calculateAvailableWorkingHours(taskStart, taskEnd, mockHolidays);
  
  const intersectStart = taskStart > reportStart ? taskStart : reportStart;
  const intersectEnd = taskEnd < reportEnd ? taskEnd : reportEnd;
  const windowTaskHours = calculateAvailableWorkingHours(intersectStart, intersectEnd, mockHolidays);

  const apportioned = (windowTaskHours / totalTaskHours) * plannedHours;

  console.log(`Task: 80h over ${totalTaskHours/8} working days`);
  console.log(`Window Intersection: ${windowTaskHours/8} working days`);
  console.log(`Apportioned Hours: ${apportioned}h`);
  
  if (apportioned === 40) {
    console.log('✅ TEST PASSED: Linear interpolation is correct.');
  } else {
    console.log('❌ TEST FAILED: Math mismatch.');
  }
}

testInterpolation();
