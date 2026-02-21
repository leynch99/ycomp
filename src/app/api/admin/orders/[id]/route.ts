import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import type { OrderStatus, PayoutStatus } from "@prisma/client";

export async function GET(_request: NextRequest, context: { params: unknown }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const resolvedParams = await Promise.resolve(context.params as { id: string });
  const order = await prisma.order.findUnique({
    where: { id: resolvedParams.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(request: NextRequest, context: { params: any }) {
  const body = await request.json();
  const status = body.status as OrderStatus;
  const resolvedParams = await Promise.resolve(context.params);

  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const order = await prisma.order.update({
    where: { id: resolvedParams.id },
    data: { status },
    include: { items: true },
  });

  if (status === "DELIVERED") {
    const products = await prisma.product.findMany({
      where: { id: { in: order.items.map((i) => i.productId ?? "") } },
      select: { id: true, supplierId: true },
    });
    const existing = await prisma.supplierPayout.findMany({
      where: { orderId: order.id },
      select: { supplierId: true },
    });
    const existingSupplierIds = new Set(existing.map((p) => p.supplierId));
    const perSupplier = new Map<string, number>();

    order.items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;
      const current = perSupplier.get(product.supplierId) ?? 0;
      perSupplier.set(product.supplierId, current + item.margin * item.qty);
    });

    for (const [supplierId, amount] of perSupplier.entries()) {
      if (existingSupplierIds.has(supplierId)) continue;
      await prisma.supplierPayout.create({
        data: {
          orderId: order.id,
          supplierId,
          amount,
          status: "PENDING" as PayoutStatus,
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
