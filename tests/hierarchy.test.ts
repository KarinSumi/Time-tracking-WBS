import { describe, it, expect, vi } from 'vitest';
// @ts-ignore
import { getOrganizationSubtree } from '../src/services/OrganizationService';
// @ts-ignore
import prisma from '../src/lib/prisma';

vi.mock('../src/lib/prisma', () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

describe('Organization Hierarchy', () => {
  it('should fetch all children IDs recursively', async () => {
    const mockOrgId = 'root-org-id';
    const mockSubtree = [
      { id: 'root-org-id' },
      { id: 'child-1' },
      { id: 'grandchild-1' },
    ];

    (prisma.$queryRaw as any).mockResolvedValue(mockSubtree);

    const result = await getOrganizationSubtree(mockOrgId);
    expect(result).toEqual(['root-org-id', 'child-1', 'grandchild-1']);
    expect(prisma.$queryRaw).toHaveBeenCalled();
  });
});
