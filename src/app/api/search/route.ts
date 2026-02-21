import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SearchItem = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  salePrice: number;
  image: string | null;
};

function scoreMatch(q: string, p: { name: string; brand: string; sku: string; popularity: number }): number {
  const qL = q.toLowerCase();
  const nameL = p.name.toLowerCase();
  const brandL = p.brand.toLowerCase();
  const skuL = p.sku.toLowerCase();

  let score = 0;
  if (nameL.includes(qL)) score += 100;
  if (nameL.startsWith(qL)) score += 50;
  if (brandL.includes(qL)) score += 40;
  if (brandL.startsWith(qL)) score += 30;
  if (skuL.includes(qL)) score += 20;

  return score * 10 + Math.min(p.popularity, 100);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ items: [], hints: null });

  const [categories, products, allBrands] = await Promise.all([
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
      take: 30,
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        salePrice: true,
        sku: true,
        popularity: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    }),
    prisma.product.findMany({
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { popularity: "desc" },
      take: 12,
    }),
  ]);

  const ranked = products
    .map((p) => ({
      ...p,
      score: scoreMatch(q, { name: p.name, brand: p.brand, sku: p.sku, popularity: p.popularity }),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const items: SearchItem[] = ranked.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    salePrice: p.salePrice,
    image: p.images[0]?.url ?? null,
  }));

  const hints =
    items.length === 0
      ? {
          categories: categories.slice(0, 4),
          brands: allBrands.map((b) => b.brand).filter((b) => b).slice(0, 6),
        }
      : null;

  return NextResponse.json({ items, hints });
}
