/**
 * Utility functions to reduce code duplication across the enterprise-time-logger project.
 */

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import type { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async route handler to automatically catch errors and send a 500 response.
 * Usage: router.post('/', authMiddleware, asyncHandler(async (req, res) => { ... }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Creates an audit log entry.
 * @param tx - Prisma transaction client or regular PrismaClient.
 * @param params - Audit log details.
 */
export async function createAuditLog(
  tx: any,
  params: {
    entityType: string;
    entityId: string;
    action: string;
    performedBy: string;
    oldValues?: object | null;
    newValues?: object | null;
  }
) {
  await tx.auditLog.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      performedBy: params.performedBy,
      oldValues: (params.oldValues ?? null) as any,
      newValues: (params.newValues ?? null) as any,
    },
  });
}

/**
 * Runs a Prisma transaction and returns the result.
 * Simplifies repetitive prisma.$transaction blocks.
 */
export async function runTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback);
}

/**
 * Safe JSON.parse with fallback.
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Delays execution for a given number of milliseconds.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
