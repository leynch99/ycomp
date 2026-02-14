import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const regions = await prisma.npCity.findMany({
    select: { region: true },
    distinct: ["region"],
    orderBy: { region: "asc" },
  });
  return NextResponse.json({ regions: regions.map((r) => r.region) });
}
