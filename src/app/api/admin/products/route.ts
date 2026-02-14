import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      sku: body.sku,
      brand: body.brand,
      description: body.description ?? "Опис буде додано пізніше.",
      categoryId: body.categoryId,
      supplierId: body.supplierId,
      costPrice: Number(body.costPrice),
      salePrice: Number(body.salePrice),
    },
  });
  return NextResponse.json({ id: product.id });
}
