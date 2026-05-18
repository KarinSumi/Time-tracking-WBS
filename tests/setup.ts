import { vi } from 'vitest';
import prisma from '../src/lib/prisma';
import jwt from 'jsonwebtoken';

// Ensure consistent secret with auth middleware
const JWT_SECRET = process.env.JWT_SECRET || 'aion-dev-secret-key-change-in-production';
process.env.JWT_SECRET = JWT_SECRET;

/**
 * Creates a complete test environment: Org, User, and valid Auth Token.
 */
export async function createTestUser(role: 'USER' | 'ADMIN' | 'SUPER_ADMIN' = 'USER', existingOrgId?: string) {
  let orgId = existingOrgId;
  
  if (!orgId) {
    const org = await prisma.organization.create({
      data: { name: `Test Org ${Date.now()}-${Math.random()}` }
    });
    orgId = org.id;
  }

  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}-${Math.random()}@example.com`,
      passwordHash: 'hashed_password_123',
      name: 'Test User',
      role,
      orgId: orgId
    }
  });

  const token = jwt.sign(
    { userId: user.id, orgId: orgId, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, orgId, token };
}

/**
 * Clean up database after tests.
 */
export async function cleanupDatabase() {
  const tables = ['AuditLog', 'TimeEntry', 'PlannedTask', 'Phase', 'Project', 'Holiday', 'User', 'Organization'];
  for (const table of tables) {
    try {
      const modelName = table.charAt(0).toLowerCase() + table.slice(1);
      if ((prisma as any)[modelName]) {
        await (prisma as any)[modelName].deleteMany();
      }
    } catch (e) {
      // Ignore
    }
  }
}
