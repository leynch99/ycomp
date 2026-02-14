import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  if (!product) return NextResponse.json({ product: null }, { status: 404 });
  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      brand: product.brand,
      salePrice: product.salePrice,
      oldPrice: product.oldPrice,
      stockQty: product.stockQty,
      inStock: product.inStock,
      leadTimeMinDays: product.leadTimeMinDays,
      leadTimeMaxDays: product.leadTimeMaxDays,
      image: product.images[0]?.url,
      socket: product.socket,
      ramType: product.ramType,
      psuWattage: product.psuWattage,
      powerW: product.powerW,
    },
  });
}
