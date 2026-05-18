import { Holiday } from '@prisma/client';

/**
 * Calculates total available working hours between two dates,
 * excluding weekends and provided holidays.
 * Standard workday is assumed to be 8 hours.
 */
export function calculateAvailableWorkingHours(
  startDate: Date,
  endDate: Date,
  holidays: Holiday[]
): number {
  const holidayDates = new Set(
    holidays.map(h => new Date(h.date).toDateString())
  );
  
  let totalHours = 0;
  const current = new Date(startDate);
  // Ensure we compare at midnight for the loop condition
  const target = new Date(endDate);
  
  // Create a clean copy to avoid modifying original dates
  const iter = new Date(current);
  iter.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  while (iter <= target) {
    const dayOfWeek = iter.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidayDates.has(iter.toDateString());

    if (!isWeekend && !isHoliday) {
      totalHours += 8;
    }
    
    // Move to next day
    iter.setDate(iter.getDate() + 1);
  }

  return totalHours;
}
