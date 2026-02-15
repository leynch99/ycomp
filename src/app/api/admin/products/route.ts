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
      description: body.description || "Опис буде додано пізніше.",
      categoryId: body.categoryId,
      supplierId: body.supplierId,
      costPrice: Number(body.costPrice),
      salePrice: Number(body.salePrice),
      oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
      inStock: body.inStock ?? true,
      stockQty: body.stockQty ? Number(body.stockQty) : null,
      isDeal: body.isDeal ?? false,
      isOutlet: body.isOutlet ?? false,
      popularity: body.popularity ? Number(body.popularity) : 50,
      leadTimeMinDays: body.leadTimeMinDays ? Number(body.leadTimeMinDays) : 1,
      leadTimeMaxDays: body.leadTimeMaxDays ? Number(body.leadTimeMaxDays) : 7,
      socket: body.socket || null,
      cores: body.cores ? Number(body.cores) : null,
      threads: body.threads ? Number(body.threads) : null,
      chipset: body.chipset || null,
      formFactor: body.formFactor || null,
      ramType: body.ramType || null,
      ramCapacity: body.ramCapacity ? Number(body.ramCapacity) : null,
      ramFrequency: body.ramFrequency ? Number(body.ramFrequency) : null,
      storageType: body.storageType || null,
      storageCapacity: body.storageCapacity ? Number(body.storageCapacity) : null,
      psuWattage: body.psuWattage ? Number(body.psuWattage) : null,
      psuCert: body.psuCert || null,
      powerW: body.powerW ? Number(body.powerW) : null,
    },
  });

  // Create images if provided
  if (body.images && Array.isArray(body.images) && body.images.length > 0) {
    await prisma.productImage.createMany({
      data: body.images.map((url: string, i: number) => ({
        productId: product.id,
        url,
        position: i,
      })),
    });
  } else {
    await prisma.productImage.create({
      data: { productId: product.id, url: "/images/placeholder.svg", position: 0 },
    });
  }

  return NextResponse.json({ id: product.id });
}
