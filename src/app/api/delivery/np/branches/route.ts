import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NP_API = "https://api.novaposhta.ua/v2.0/json/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityRef = searchParams.get("cityRef")?.trim();
  if (!cityRef) return NextResponse.json({ branches: [] });

  const apiKey = process.env.NP_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(NP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          modelName: "AddressGeneral",
          calledMethod: "getWarehouses",
          methodProperties: { CityRef: cityRef, Limit: "100", Page: "1" },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const branches = data.data.map((w: Record<string, string>) => ({
          ref: w.Ref,
          name: w.Description,
          address: w.ShortAddress || w.Description,
        }));
        return NextResponse.json({ branches });
      }
    } catch (e) {
      console.error("[NP branches]", e);
    }
  }

  // Fallback to local DB
  const branches = await prisma.npBranch.findMany({
    where: { cityId: cityRef },
    orderBy: { name: "asc" },
    take: 50,
  });
  return NextResponse.json({
    branches: branches.map((b) => ({ ref: b.id, name: b.name, address: b.address })),
  });
}
