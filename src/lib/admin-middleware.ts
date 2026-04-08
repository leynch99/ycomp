/**
 * Middleware для проверки прав доступа в API routes
 */

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { hasPermission, canAccessAdmin, type Resource, type Action } from "@/lib/permissions";
import { logAdminAction, type AdminAction, type AdminResource } from "@/lib/admin-log";

/**
 * Require admin access
 */
export async function requireAdmin() {
  const user = await getSessionUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }

  if (!canAccessAdmin(user.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  }

  return { error: null, user };
}

/**
 * Require specific permission
 */
export async function requirePermission(resource: Resource, action: Action) {
  const { error, user } = await requireAdmin();
  if (error) return { error, user: null };

  const allowed = await hasPermission(user!.role as "ADMIN" | "MANAGER" | "VIEWER", resource, action);

  if (!allowed) {
    return {
      error: NextResponse.json(
        { error: "Insufficient permissions", required: { resource, action } },
        { status: 403 }
      ),
      user: null,
    };
  }

  return { error: null, user };
}

/**
 * Wrapper для API routes с проверкой прав и логированием
 */
export function withPermission(
  resource: Resource,
  action: Action,
  handler: (request: Request, context: { user: { id: string; email: string; role: string } }) => Promise<Response>
) {
  return async (request: Request, context?: { params: Promise<Record<string, string>> }) => {
    const { error, user } = await requirePermission(resource, action);
    if (error || !user) return error;

    // Log action
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Await params if provided
    const params = context?.params ? await context.params : undefined;

    await logAdminAction({
      userId: user.id,
      action: action as AdminAction,
      resource: resource as AdminResource,
      resourceId: params?.id,
      ipAddress,
      userAgent,
    });

    return handler(request, { user });
  };
}

/**
 * Get client IP from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  return "unknown";
}
