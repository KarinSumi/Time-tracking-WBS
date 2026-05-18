import prisma from '../lib/prisma';

export interface UserContext {
  userId: string;
  orgId: string;
  role: string;
}

export async function listHolidays(context: UserContext) {
  return await prisma.holiday.findMany({
    where: { orgId: context.orgId },
    orderBy: { date: 'asc' }
  });
}

export async function createHoliday(data: { date: string, description: string }, context: UserContext) {
  const holidayDate = new Date(data.date);
  holidayDate.setHours(0, 0, 0, 0);

  const existing = await prisma.holiday.findFirst({
    where: { 
      orgId: context.orgId, 
      date: holidayDate 
    }
  });

  if (existing) {
    throw new Error('A holiday already exists on this date');
  }

  return await prisma.holiday.create({
    data: {
      date: holidayDate,
      description: data.description,
      orgId: context.orgId
    }
  });
}

export async function updateHoliday(id: string, data: { date?: string, description?: string }, context: UserContext) {
  const existing = await prisma.holiday.findUnique({ where: { id } });
  if (!existing || existing.orgId !== context.orgId) {
    throw new Error('Holiday not found or unauthorized');
  }

  const updateData: any = {};
  if (data.date) {
    const holidayDate = new Date(data.date);
    holidayDate.setHours(0, 0, 0, 0);
    updateData.date = holidayDate;
  }
  if (data.description) updateData.description = data.description;

  return await prisma.holiday.update({
    where: { id },
    data: updateData
  });
}

export async function deleteHoliday(id: string, context: UserContext) {
  const existing = await prisma.holiday.findUnique({ where: { id } });
  if (!existing || existing.orgId !== context.orgId) {
    throw new Error('Holiday not found or unauthorized');
  }

  await prisma.holiday.delete({ where: { id } });
}
