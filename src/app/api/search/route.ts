import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeSearchQuery } from "@/lib/search-query";
import { emitSearchEvent } from "@/lib/search-telemetry";

export type MatchType = "sku_exact" | "name_prefix" | "name_contains" | "brand_contains";

export type SearchItem = {
  id: string;
  name: string;
  slug: string;
  salePrice: number;
  image: string | null;
  matchType: MatchType;
};

function scoreAndClassify(
  q: string,
  p: { name: string; sku: string; brand: string }
): { score: number; matchType: MatchType } {
  const qL = q.toLowerCase();
  const skuL = p.sku.toLowerCase();
  const nameL = p.name.toLowerCase();
  const brandL = p.brand.toLowerCase();

  if (skuL === qL) return { score: 1000, matchType: "sku_exact" };
  if (skuL.includes(qL)) return { score: 900, matchType: "sku_exact" };
  if (nameL.startsWith(qL)) return { score: 300, matchType: "name_prefix" };
  if (nameL.includes(qL)) return { score: 200, matchType: "name_contains" };
  if (brandL.includes(qL)) return { score: 100, matchType: "brand_contains" };
  return { score: 50, matchType: "brand_contains" };
}

export async function GET(request: Request) {
  const start = Date.now();
  const { searchParams } = new URL(request.url);
  const rawQ = searchParams.get("q")?.trim();
  const q = rawQ ? normalizeSearchQuery(rawQ) : "";

  if (!q) return NextResponse.json({ items: [] });

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [{ popularity: "desc" }, { createdAt: "desc" }],
    take: 50,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      brand: true,
      salePrice: true,
      popularity: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });

  const scored = products.map((p) => {
    const { score, matchType } = scoreAndClassify(q, p);
    return { ...p, score: score + Math.min(p.popularity, 100), matchType };
  });
  scored.sort((a, b) => b.score - a.score);

  const items: SearchItem[] = scored.slice(0, 8).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    salePrice: p.salePrice,
    image: p.images[0]?.url ?? null,
    matchType: p.matchType,
  }));

  const latency = Date.now() - start;
  emitSearchEvent("search_query", {
    query_length: q.length,
    latency_ms: latency,
    results_count: items.length,
  });

  return NextResponse.json({ items });
}
