import { NextResponse } from "next/server";
import { withPermission } from "@/lib/admin-middleware";
import { getAdminLogs } from "@/lib/admin-log";

async function getLogsHandler(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters = {
    userId: searchParams.get("userId") || undefined,
    action: searchParams.get("action") as any || undefined,
    resource: searchParams.get("resource") as any || undefined,
    startDate: searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined,
    endDate: searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined,
    limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50,
    offset: searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0,
  };

  const { logs, total } = await getAdminLogs(filters);

  return NextResponse.json({ logs, total });
}

export const GET = withPermission("settings", "read", getLogsHandler);
