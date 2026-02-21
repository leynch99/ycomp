import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { rateLimitComposite, normalizePhone } from "@/lib/rate-limit";
import { withApiLog } from "@/lib/api-with-logging";
import { emitSecurityEvent, maskEmail, maskPhone } from "@/lib/security-telemetry";

async function ordersHandler(request: Request) {
  const body = await request.json();
  const phone = String(body?.phone ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const id = phone ? normalizePhone(phone) : email || null;

  const { ok: allowed } = await rateLimitComposite(request, "order", id, 10, 5, 60_000);
  if (!allowed) {
    emitSecurityEvent("rate_limit_block", { endpoint: "order" });
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  }

  const items = body.items as Array<{
    id: string;
    name: string;
    sku: string;
    salePrice: number;
    qty: number;
  }>;

  if (!items?.length) {
    return NextResponse.json({ error: "Empty order" }, { status: 400 });
  }

  const productIds = [...new Set(items.map((i) => i.id))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    if (!productMap.has(item.id)) {
      emitSecurityEvent("order_validation_failed", {
        reason: "product_not_found",
        productId: item.id,
        identifier: id ? (phone ? maskPhone(phone) : maskEmail(email)) : undefined,
      });
      return NextResponse.json({ error: "Product not found" }, { status: 400 });
    }
  }

  const number = `YC-${Date.now().toString().slice(-6)}`;
  let total = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(item.id)!;
    const qty = Math.max(1, Math.min(99, Math.floor(Number(item.qty) || 1)));
    const price = product.salePrice;
    total += price * qty;
    const cost = product.costPrice ?? Math.round(price * 0.8);
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      qty,
      price,
      costPrice: cost,
      margin: price - cost,
    };
  });

  const sessionUser = await getSessionUser();
  const order = await prisma.order.create({
    data: {
      number,
      customerName: body.name,
      phone: body.phone,
      email: body.email,
      city: body.city,
      npBranch: body.npBranch,
      paymentMethod: body.paymentMethod,
      comment: body.comment ?? null,
      total,
      userId: sessionUser?.id,
      items: { create: orderItems },
    },
  });

  emitSecurityEvent("order_created", {
    orderId: order.id,
    number: order.number,
    identifier: id ? (phone ? maskPhone(phone) : maskEmail(email)) : undefined,
  });
  return NextResponse.json({ id: order.id, number: order.number });
}

export const POST = withApiLog(ordersHandler);
