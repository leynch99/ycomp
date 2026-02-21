import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { rateLimitComposite, normalizePhone } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const phone = String(body?.phone ?? "").trim();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const id = phone ? normalizePhone(phone) : email || null;
  const { ok: allowed } = await rateLimitComposite(request, "order", id, 10, 5, 60_000);
  if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
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

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.id) } },
  });

  const number = `YC-${Date.now().toString().slice(-6)}`;
  const total = items.reduce((sum, item) => sum + item.salePrice * item.qty, 0);

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
      items: {
        create: items.map((item) => {
          const product = products.find((p) => p.id === item.id);
          const cost = product?.costPrice ?? Math.round(item.salePrice * 0.8);
          return {
            productId: item.id,
            name: item.name,
            sku: item.sku,
            qty: item.qty,
            price: item.salePrice,
            costPrice: cost,
            margin: item.salePrice - cost,
          };
        }),
      },
    },
  });

  return NextResponse.json({ id: order.id, number: order.number });
}
