import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const region = searchParams.get("region")?.trim();
  const cities = await prisma.npCity.findMany({
    where: {
      ...(region ? { region } : {}),
      ...(q
        ? {
            name: { contains: q, mode: "insensitive" },
          }
        : {}),
    },
    orderBy: { name: "asc" },
    take: 8,
  });
  return NextResponse.json({ cities });
}
