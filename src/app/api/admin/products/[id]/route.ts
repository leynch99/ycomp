import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(_request: NextRequest, context: { params: any }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const resolvedParams = await Promise.resolve(context.params);
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      images: { orderBy: { position: "asc" } },
      category: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
    },
  });
  if (!product) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PATCH(request: NextRequest, context: { params: any }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const resolvedParams = await Promise.resolve(context.params);
  const body = await request.json();

  const product = await prisma.product.update({
    where: { id: resolvedParams.id },
    data: {
      name: body.name,
      slug: body.slug,
      sku: body.sku,
      brand: body.brand,
      description: body.description || undefined,
      categoryId: body.categoryId || undefined,
      supplierId: body.supplierId || undefined,
      costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
      salePrice: body.salePrice !== undefined ? Number(body.salePrice) : undefined,
      oldPrice: body.oldPrice !== undefined ? (body.oldPrice ? Number(body.oldPrice) : null) : undefined,
      inStock: body.inStock !== undefined ? body.inStock : undefined,
      stockQty: body.stockQty !== undefined ? (body.stockQty ? Number(body.stockQty) : null) : undefined,
      isDeal: body.isDeal !== undefined ? body.isDeal : undefined,
      isOutlet: body.isOutlet !== undefined ? body.isOutlet : undefined,
      popularity: body.popularity !== undefined ? Number(body.popularity) : undefined,
      leadTimeMinDays: body.leadTimeMinDays !== undefined ? Number(body.leadTimeMinDays) : undefined,
      leadTimeMaxDays: body.leadTimeMaxDays !== undefined ? Number(body.leadTimeMaxDays) : undefined,
      socket: body.socket !== undefined ? (body.socket || null) : undefined,
      cores: body.cores !== undefined ? (body.cores ? Number(body.cores) : null) : undefined,
      threads: body.threads !== undefined ? (body.threads ? Number(body.threads) : null) : undefined,
      chipset: body.chipset !== undefined ? (body.chipset || null) : undefined,
      formFactor: body.formFactor !== undefined ? (body.formFactor || null) : undefined,
      ramType: body.ramType !== undefined ? (body.ramType || null) : undefined,
      ramCapacity: body.ramCapacity !== undefined ? (body.ramCapacity ? Number(body.ramCapacity) : null) : undefined,
      ramFrequency: body.ramFrequency !== undefined ? (body.ramFrequency ? Number(body.ramFrequency) : null) : undefined,
      storageType: body.storageType !== undefined ? (body.storageType || null) : undefined,
      storageCapacity: body.storageCapacity !== undefined ? (body.storageCapacity ? Number(body.storageCapacity) : null) : undefined,
      psuWattage: body.psuWattage !== undefined ? (body.psuWattage ? Number(body.psuWattage) : null) : undefined,
      psuCert: body.psuCert !== undefined ? (body.psuCert || null) : undefined,
      powerW: body.powerW !== undefined ? (body.powerW ? Number(body.powerW) : null) : undefined,
    },
  });

  // Update images if provided
  if (body.images && Array.isArray(body.images)) {
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    if (body.images.length > 0) {
      await prisma.productImage.createMany({
        data: body.images.map((url: string, i: number) => ({
          productId: product.id,
          url,
          position: i,
        })),
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, context: { params: any }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const resolvedParams = await Promise.resolve(context.params);
  await prisma.productImage.deleteMany({ where: { productId: resolvedParams.id } });
  await prisma.product.delete({ where: { id: resolvedParams.id } });
  return NextResponse.json({ ok: true });
}
