import prisma from '../lib/prisma';
import { UserContext } from './TimeEntryService';
import { createAuditLog } from '../utils/utils';

export async function getSettings(orgId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId }
  });
  if (!org) throw new Error('Organization not found');
  
  return { 
    id: org.id, 
    name: org.name,
    brandColor: org.brandColor,
    logoUrl: org.logoUrl,
    standardWorkingHours: 8.0
  };
}

export async function updateSettings(data: any, context: UserContext) {
  if (context.role !== 'ADMIN' && context.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized');
  }

  const oldOrg = await prisma.organization.findUnique({ where: { id: context.orgId } });
  if (!oldOrg) throw new Error('Organization not found');

  const updated = await prisma.organization.update({
    where: { id: context.orgId },
    data: { 
      ...(data.name && { name: data.name }),
      ...(data.brandColor && { brandColor: data.brandColor }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl })
    }
  });

  await createAuditLog(prisma, {
    entityType: 'Organization',
    entityId: context.orgId,
    action: 'UPDATE_SETTINGS',
    performedBy: context.userId,
    oldValues: oldOrg as any,
    newValues: updated as any
  });

  return updated;
}
