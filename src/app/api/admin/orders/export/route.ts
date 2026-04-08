import { NextResponse } from "next/server";
import { withPermission } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";

/**
 * Export orders to CSV
 */

async function exportOrdersHandler(request: Request, { user }: { user: any }) {
  const { searchParams } = new URL(request.url);

  const filters: Record<string, unknown> = {};

  const status = searchParams.get("status");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (status) filters.status = status;
  if (startDate || endDate) {
    filters.createdAt = {};
    if (startDate) (filters.createdAt as Record<string, unknown>).gte = new Date(startDate);
    if (endDate) (filters.createdAt as Record<string, unknown>).lte = new Date(endDate);
  }

  const orders = await prisma.order.findMany({
    where: filters,
    include: {
      items: {
        select: {
          name: true,
          sku: true,
          qty: true,
          price: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Generate CSV
  const headers = [
    "Order Number",
    "Status",
    "Customer Name",
    "Phone",
    "Email",
    "City",
    "NP Branch",
    "Payment Method",
    "Total",
    "Items Count",
    "Items",
    "Created At",
  ];

  const rows = orders.map((o) => [
    o.number,
    o.status,
    `"${o.customerName.replace(/"/g, '""')}"`,
    o.phone,
    o.email,
    `"${o.city.replace(/"/g, '""')}"`,
    `"${o.npBranch.replace(/"/g, '""')}"`,
    o.paymentMethod,
    (o.total / 100).toFixed(2),
    o.items.length,
    `"${o.items.map((i) => `${i.name} x${i.qty}`).join("; ").replace(/"/g, '""')}"`,
    o.createdAt.toISOString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

export const GET = withPermission("orders", "export", exportOrdersHandler);
