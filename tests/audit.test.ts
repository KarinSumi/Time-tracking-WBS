import { describe, it, expect, vi } from 'vitest';
import { updateTimeEntry } from '../src/services/TimeEntryService';
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
    const mockOrgId = 'org-1';
    const mockEntryId = 'entry-1';
    const oldEntry = { id: mockEntryId, userId: mockUserId, hours: 5, taskDescription: 'Old task', status: 'DRAFT', user: { orgId: mockOrgId } };
    const newEntry = { id: mockEntryId, userId: mockUserId, hours: 8, taskDescription: 'New task' };

    (prisma.timeEntry.findUnique as any).mockResolvedValue(oldEntry);
    (prisma.timeEntry.update as any).mockResolvedValue(newEntry);

    const context = { userId: mockUserId, orgId: mockOrgId, role: 'USER' };
    await updateTimeEntry(mockEntryId, { hours: 8, taskDescription: 'New task' }, context);

    expect(prisma.timeEntry.update).toHaveBeenCalled();
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });
});
