/**
 * Role-based access control (RBAC) system
 */

import { prisma } from "@/lib/prisma";

export type Role = "ADMIN" | "MANAGER" | "VIEWER" | "USER";
export type Resource = "orders" | "products" | "users" | "categories" | "suppliers" | "banners" | "blog" | "settings";
export type Action = "create" | "read" | "update" | "delete" | "export";

interface Permission {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
}

/**
 * Default permissions for each role
 */
const DEFAULT_PERMISSIONS: Record<Role, Record<Resource, Permission>> = {
  ADMIN: {
    orders: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true },
    products: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true },
    users: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true },
    categories: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true },
    suppliers: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true },
    banners: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true },
    blog: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true },
    settings: { canCreate: true, canRead: true, canUpdate: true, canDelete: true, canExport: true },
  },
  MANAGER: {
    orders: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canExport: true },
    products: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canExport: true },
    users: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: false },
    categories: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canExport: false },
    suppliers: { canCreate: false, canRead: true, canUpdate: true, canDelete: false, canExport: false },
    banners: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canExport: false },
    blog: { canCreate: true, canRead: true, canUpdate: true, canDelete: false, canExport: false },
    settings: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: false },
  },
  VIEWER: {
    orders: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: true },
    products: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: true },
    users: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: false },
    categories: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: false },
    suppliers: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: false },
    banners: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: false },
    blog: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: false },
    settings: { canCreate: false, canRead: true, canUpdate: false, canDelete: false, canExport: false },
  },
  USER: {
    orders: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: false },
    products: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: false },
    users: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: false },
    categories: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: false },
    suppliers: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: false },
    banners: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: false },
    blog: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: false },
    settings: { canCreate: false, canRead: false, canUpdate: false, canDelete: false, canExport: false },
  },
};

/**
 * Check if user has permission for action on resource
 */
export async function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): Promise<boolean> {
  // Try to get custom permission from database
  const customPermission = await prisma.permission.findUnique({
    where: {
      role_resource: {
        role,
        resource,
      },
    },
  });

  if (customPermission) {
    switch (action) {
      case "create":
        return customPermission.canCreate;
      case "read":
        return customPermission.canRead;
      case "update":
        return customPermission.canUpdate;
      case "delete":
        return customPermission.canDelete;
      case "export":
        return customPermission.canExport;
      default:
        return false;
    }
  }

  // Fall back to default permissions
  const defaultPermission = DEFAULT_PERMISSIONS[role]?.[resource];
  if (!defaultPermission) return false;

  switch (action) {
    case "create":
      return defaultPermission.canCreate;
    case "read":
      return defaultPermission.canRead;
    case "update":
      return defaultPermission.canUpdate;
    case "delete":
      return defaultPermission.canDelete;
    case "export":
      return defaultPermission.canExport;
    default:
      return false;
  }
}

/**
 * Get all permissions for a role
 */
export async function getRolePermissions(role: Role): Promise<Record<Resource, Permission>> {
  const customPermissions = await prisma.permission.findMany({
    where: { role },
  });

  const permissions = { ...DEFAULT_PERMISSIONS[role] };

  // Override with custom permissions
  for (const perm of customPermissions) {
    permissions[perm.resource as Resource] = {
      canCreate: perm.canCreate,
      canRead: perm.canRead,
      canUpdate: perm.canUpdate,
      canDelete: perm.canDelete,
      canExport: perm.canExport,
    };
  }

  return permissions;
}

/**
 * Update permission for role and resource
 */
export async function updatePermission(
  role: Role,
  resource: Resource,
  permissions: Partial<Permission>
) {
  return prisma.permission.upsert({
    where: {
      role_resource: {
        role,
        resource,
      },
    },
    create: {
      role,
      resource,
      canCreate: permissions.canCreate ?? false,
      canRead: permissions.canRead ?? true,
      canUpdate: permissions.canUpdate ?? false,
      canDelete: permissions.canDelete ?? false,
      canExport: permissions.canExport ?? false,
    },
    update: permissions,
  });
}

/**
 * Check if user is admin
 */
export function isAdmin(role: string): boolean {
  return role === "ADMIN";
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdmin(role: string): boolean {
  return ["ADMIN", "MANAGER", "VIEWER"].includes(role);
}

/**
 * Require permission middleware helper
 */
export function requirePermission(resource: Resource, action: Action) {
  return async (role: Role): Promise<boolean> => {
    return hasPermission(role, resource, action);
  };
}
