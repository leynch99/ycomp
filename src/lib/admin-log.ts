/**
 * Admin action logging system
 * Tracks all admin actions for audit and security
 */

import { prisma } from "@/lib/prisma";

export type AdminAction = "create" | "update" | "delete" | "view" | "export" | "login" | "logout";
export type AdminResource = "order" | "product" | "user" | "category" | "supplier" | "banner" | "blog" | "settings";

interface LogActionParams {
  userId: string;
  action: AdminAction;
  resource: AdminResource;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log admin action
 */
export async function logAdminAction(params: LogActionParams): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        resourceId: params.resourceId,
        details: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error("[admin-log] Failed to log action:", error);
  }
}

/**
 * Get admin logs with filters
 */
export async function getAdminLogs(filters?: {
  userId?: string;
  action?: AdminAction;
  resource?: AdminResource;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.userId) where.userId = filters.userId;
  if (filters?.action) where.action = filters.action;
  if (filters?.resource) where.resource = filters.resource;
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) (where.createdAt as Record<string, unknown>).gte = filters.startDate;
    if (filters.endDate) (where.createdAt as Record<string, unknown>).lte = filters.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
    }),
    prisma.adminLog.count({ where }),
  ]);

  return { logs, total };
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [totalActions, actionsByType, recentActions] = await Promise.all([
    prisma.adminLog.count({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
    }),
    prisma.adminLog.groupBy({
      by: ["action"],
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      _count: { action: true },
    }),
    prisma.adminLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    totalActions,
    actionsByType,
    recentActions,
  };
}

/**
 * Get resource activity (who modified what)
 */
export async function getResourceActivity(resource: AdminResource, resourceId: string, limit = 20) {
  return prisma.adminLog.findMany({
    where: {
      resource,
      resourceId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Clean old logs (retention policy)
 */
export async function cleanOldLogs(retentionDays = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const deleted = await prisma.adminLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  console.log(`[admin-log] Cleaned ${deleted.count} old logs`);
  return deleted.count;
}
