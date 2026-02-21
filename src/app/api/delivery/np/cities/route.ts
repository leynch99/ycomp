import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logExternalService } from "@/lib/logger";
import { withApiLog } from "@/lib/api-with-logging";

const NP_API = "https://api.novaposhta.ua/v2.0/json/";

async function npCitiesHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ cities: [] });

  const apiKey = process.env.NP_API_KEY;

  if (apiKey) {
    const start = Date.now();
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
      const latencyMs = Date.now() - start;
      if (data.success && data.data?.[0]?.Addresses) {
        logExternalService("np_cities", { success: true, latencyMs });
        const cities = data.data[0].Addresses.map((a: Record<string, string>) => ({
          ref: a.DeliveryCity || a.Ref,
          name: a.Present || a.MainDescription,
        }));
        return NextResponse.json({ cities });
      }
      logExternalService("np_cities", { success: false, latencyMs, error: data.errors?.[0] ?? "unknown" });
    } catch (e) {
      logExternalService("np_cities", {
        success: false,
        latencyMs: Date.now() - start,
        error: e instanceof Error ? e.message : String(e),
      });
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

export const GET = withApiLog(npCitiesHandler);
