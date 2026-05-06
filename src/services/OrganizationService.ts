import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export async function getOrganizationSubtree(orgId: string): Promise<string[]> {
  const query = Prisma.sql`
    WITH RECURSIVE org_tree AS (
      SELECT id FROM "Organization" WHERE id = ${orgId}
      UNION ALL
      SELECT o.id FROM "Organization" o
      INNER JOIN org_tree ot ON o."parentId" = ot.id
    )
    SELECT id FROM org_tree;
  `;

  const results = await prisma.$queryRaw<{ id: string }[]>(query);
  return results.map(row => row.id);
}
