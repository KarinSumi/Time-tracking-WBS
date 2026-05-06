import { describe, it, expect, vi } from 'vitest';
// @ts-ignore
import { updateTimeEntry } from '../src/services/TimeEntryService';
// @ts-ignore
import prisma from '../src/lib/prisma';

vi.mock('../src/lib/prisma', () => ({
  default: {
    timeEntry: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

describe('TimeEntry Audit System', () => {
  it('should create an audit log when updating a time entry', async () => {
    const mockUserId = 'user-1';
    const mockEntryId = 'entry-1';
    const oldEntry = { id: mockEntryId, hours: 5, taskDescription: 'Old task' };
    const newEntry = { id: mockEntryId, hours: 8, taskDescription: 'New task' };

    (prisma.timeEntry.findUnique as any).mockResolvedValue(oldEntry);
    (prisma.timeEntry.update as any).mockResolvedValue(newEntry);

    await updateTimeEntry(mockEntryId, { hours: 8, taskDescription: 'New task' }, mockUserId);

    expect(prisma.timeEntry.update).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        entityType: 'TimeEntry',
        entityId: mockEntryId,
        action: 'UPDATE',
        performedBy: mockUserId,
        oldValues: oldEntry,
        newValues: newEntry,
      },
    });
  });
});
