import { describe, it, expect } from 'vitest';
import './setup';
import prisma from '../src/lib/prisma';

describe('System Invariants & Environment Checks', () => {
  it('should verify database connection is active', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    expect(result).toBeDefined();
    expect(Number((result as any)[0].connected)).toBe(1);
  });

  it('should verify environment configuration settings', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(0);
  });

  it('should verify database model structure and read/write', async () => {
    const orgName = 'System Invariant Temp Org';
    const org = await prisma.organization.create({
      data: { name: orgName }
    });
    expect(org.id).toBeDefined();
    expect(org.name).toBe(orgName);

    // Clean up
    await prisma.organization.delete({ where: { id: org.id } });
  });
});
