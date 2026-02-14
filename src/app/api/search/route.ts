import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ suggestions: [] });
  const categories = await prisma.category.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    take: 6,
    select: { id: true, name: true, slug: true },
  });
  return NextResponse.json({ suggestions: categories });
}
