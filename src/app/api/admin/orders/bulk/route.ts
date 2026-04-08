import { NextResponse } from "next/server";
import { withPermission } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";

/**
 * Bulk operations for orders
 */

async function bulkUpdateStatusHandler(request: Request, { user }: { user: any }) {
  const body = await request.json();
  const { orderIds, status } = body;

  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return NextResponse.json({ error: "Order IDs required" }, { status: 400 });
  }

  if (!status) {
    return NextResponse.json({ error: "Status required" }, { status: 400 });
  }

  const validStatuses = ["NEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const result = await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      status,
    });
  } catch (error) {
    console.error("[bulk-update-status] Error:", error);
    return NextResponse.json(
      { error: "Failed to update orders" },
      { status: 500 }
    );
  }
}

export const PATCH = withPermission("orders", "update", bulkUpdateStatusHandler);
