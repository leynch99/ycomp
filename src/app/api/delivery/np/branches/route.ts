import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logExternalService } from "@/lib/logger";
import { withApiLog } from "@/lib/api-with-logging";

const NP_API = "https://api.novaposhta.ua/v2.0/json/";

async function npBranchesHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityRef = searchParams.get("cityRef")?.trim();
  if (!cityRef) return NextResponse.json({ branches: [] });

  const apiKey = process.env.NP_API_KEY;

  if (apiKey) {
    const start = Date.now();
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
      const latencyMs = Date.now() - start;
      if (data.success && data.data) {
        logExternalService("np_branches", { success: true, latencyMs });
        const branches = data.data.map((w: Record<string, string>) => ({
          ref: w.Ref,
          name: w.Description,
          address: w.ShortAddress || w.Description,
        }));
        return NextResponse.json({ branches });
      }
    } catch (e) {
      logExternalService("np_branches", {
        success: false,
        latencyMs: Date.now() - start,
        error: e instanceof Error ? e.message : String(e),
      });
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

export const GET = withApiLog(npBranchesHandler);
