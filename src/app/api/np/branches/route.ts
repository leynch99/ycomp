import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("cityId");
  if (!cityId) {
    return NextResponse.json({ branches: [] });
  }
  const branches = await prisma.npBranch.findMany({
    where: { cityId },
    orderBy: { name: "asc" },
    take: 50,
  });
  return NextResponse.json({ branches });
}
