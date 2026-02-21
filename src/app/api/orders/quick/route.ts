import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitComposite, normalizePhone } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const phone = String(body?.phone ?? "").trim();
  const { ok: allowed } = await rateLimitComposite(request, "quick-order", normalizePhone(phone), 3, 3, 60_000);
  if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  const name = String(body?.name ?? "").trim().slice(0, 100);
  const productId = String(body?.productId ?? "");

  if (!name || !phone || !productId) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "product_not_found" }, { status: 404 });

  const order = await prisma.order.create({
    data: {
      number: `QO-${Date.now().toString().slice(-8)}`,
      status: "NEW",
      customerName: name,
      phone: phone.slice(0, 20),
      email: "",
      city: "",
      npBranch: "",
      paymentMethod: "callback",
      comment: "Купити в 1 клік",
      total: product.salePrice,
      items: {
        create: [
          {
            productId: product.id,
            name: product.name,
            sku: product.sku,
            qty: 1,
            price: product.salePrice,
            costPrice: product.costPrice,
            margin: product.salePrice - product.costPrice,
          },
        ],
      },
    },
  });

  return NextResponse.json({ number: order.number });
}
