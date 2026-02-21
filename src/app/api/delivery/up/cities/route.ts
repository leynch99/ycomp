import { NextResponse } from "next/server";
import { logExternalService } from "@/lib/logger";
import { withApiLog } from "@/lib/api-with-logging";

const UP_API = "https://www.ukrposhta.ua/address-classifier-ws";

async function upCitiesHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ cities: [] });

  const bearerToken = process.env.UKRPOSHTA_API_KEY;

  if (bearerToken) {
    const start = Date.now();
    try {
      const res = await fetch(
        `${UP_API}/get_city_by_name?city_name=${encodeURIComponent(q)}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            Accept: "application/json",
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const cities = (Array.isArray(data) ? data : data.Entries?.Entry ?? []).slice(0, 10).map(
          (c: Record<string, string>) => ({
            id: c.CITY_ID || c.cityId || c.CITY_UA || c.id,
            name: c.CITY_UA || c.cityNameUa || c.name || c.CITY_EN,
            region: c.REGION_UA || c.regionNameUa || "",
          })
        );
        return NextResponse.json({ cities });
      }
    } catch (e) {
      logExternalService("up_cities", {
        success: false,
        latencyMs: Date.now() - start,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // Fallback: use NP local DB cities as a generic Ukrainian city list
  const { prisma } = await import("@/lib/prisma");
  const cities = await prisma.npCity.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    orderBy: { name: "asc" },
    take: 10,
  });
  return NextResponse.json({
    cities: cities.map((c) => ({ id: c.id, name: c.name, region: c.region })),
  });
}

export const GET = withApiLog(upCitiesHandler);
