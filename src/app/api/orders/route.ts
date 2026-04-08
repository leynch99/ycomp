import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { rateLimitComposite, normalizePhone } from "@/lib/rate-limit";
import { withApiLog } from "@/lib/api-with-logging";
import { emitSecurityEvent, maskEmail, maskPhone } from "@/lib/security-telemetry";
import { validateRequest, createOrderSchema } from "@/lib/validation";
import { notifyAdminNewOrder } from "@/lib/telegram";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendOrderConfirmationSms } from "@/lib/sms";

async function ordersHandler(request: Request) {
  // Validate request body
  const validation = await validateRequest(request, createOrderSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const body = validation.data;
  const phone = body.phone;
  const email = body.email;
  const id = normalizePhone(phone);

  const { ok: allowed } = await rateLimitComposite(request, "order", id, 10, 5, 60_000);
  if (!allowed) {
    emitSecurityEvent("rate_limit_block", { endpoint: "order" });
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  }

  const items = body.items;
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
        identifier: maskPhone(phone),
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
    include: {
      items: true,
    },
  });

  emitSecurityEvent("order_created", {
    orderId: order.id,
    number: order.number,
    identifier: maskPhone(phone),
  });

  // Send notifications (async, don't wait)
  Promise.all([
    // Notify admin via Telegram
    notifyAdminNewOrder({
      number: order.number,
      customerName: order.customerName,
      phone: order.phone,
      total: order.total,
      itemCount: order.items.length,
    }),
    // Send confirmation email to customer
    sendOrderConfirmationEmail({
      number: order.number,
      customerName: order.customerName,
      email: order.email,
      total: order.total,
      items: order.items.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      })),
      city: order.city,
      npBranch: order.npBranch,
    }),
    // Send confirmation SMS to customer
    sendOrderConfirmationSms({
      number: order.number,
      phone: order.phone,
      total: order.total,
    }),
  ]).catch((error) => {
    console.error("[orders] Failed to send notifications:", error);
  });

  return NextResponse.json({ id: order.id, number: order.number });
}

export const POST = withApiLog(ordersHandler);
