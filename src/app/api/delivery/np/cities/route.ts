import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NP_API = "https://api.novaposhta.ua/v2.0/json/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ cities: [] });

  const apiKey = process.env.NP_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(NP_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          modelName: "Address",
          calledMethod: "searchSettlements",
          methodProperties: { CityName: q, Limit: "10", Page: "1" },
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.[0]?.Addresses) {
        const cities = data.data[0].Addresses.map((a: Record<string, string>) => ({
          ref: a.DeliveryCity || a.Ref,
          name: a.Present || a.MainDescription,
        }));
        return NextResponse.json({ cities });
      }
    } catch (e) {
      console.error("[NP cities]", e);
    }
  }

  // Fallback to local DB
  const cities = await prisma.npCity.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    orderBy: { name: "asc" },
    take: 10,
  });
  return NextResponse.json({
    cities: cities.map((c) => ({ ref: c.id, name: `${c.name}, ${c.region}` })),
  });
}
