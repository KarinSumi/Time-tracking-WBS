import prisma from '../lib/prisma';

export async function updateTimeEntry(id: string, data: any, userId: string) {
  return await prisma.$transaction(async (tx) => {
    const oldEntry = await tx.timeEntry.findUnique({ where: { id } });
    
    if (!oldEntry) {
      throw new Error('Time entry not found');
    }

    const newEntry = await tx.timeEntry.update({
      where: { id },
      data,
    });

    await tx.auditLog.create({
      data: {
        entityType: 'TimeEntry',
        entityId: id,
        action: 'UPDATE',
        performedBy: userId,
        oldValues: oldEntry as any,
        newValues: newEntry as any,
      },
    });

    return newEntry;
  });
}
