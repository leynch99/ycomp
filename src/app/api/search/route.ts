import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ suggestions: [], products: [] });

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 6,
      select: { id: true, name: true, slug: true },
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 8,
      orderBy: { popularity: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        salePrice: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    }),
  ]);

  const productsWithImage = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    salePrice: p.salePrice,
    image: p.images[0]?.url ?? null,
  }));

  return NextResponse.json({
    suggestions: categories,
    products: productsWithImage,
  });
}
