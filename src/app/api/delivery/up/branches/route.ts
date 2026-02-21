import { NextResponse } from "next/server";
import { logExternalService } from "@/lib/logger";
import { withApiLog } from "@/lib/api-with-logging";

const UP_API = "https://www.ukrposhta.ua/address-classifier-ws";

async function upBranchesHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityId = searchParams.get("cityId")?.trim();
  if (!cityId) return NextResponse.json({ branches: [] });

  const bearerToken = process.env.UKRPOSHTA_API_KEY;

  if (bearerToken) {
    const start = Date.now();
    try {
      const res = await fetch(
        `${UP_API}/get_postoffices_by_city_id?city_id=${encodeURIComponent(cityId)}`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            Accept: "application/json",
          },
        }
      );
      if (res.ok) {
        logExternalService("up_branches", { success: true, latencyMs: Date.now() - start });
        const data = await res.json();
        const entries = Array.isArray(data) ? data : data.Entries?.Entry ?? [];
        const branches = entries.slice(0, 100).map((b: Record<string, string>) => ({
          id: b.POSTCODE || b.postcode || b.id,
          name: b.PO_LONG || b.postOfficeLongNameUa || b.name || `Відділення ${b.POSTCODE}`,
          address: b.ADDRESS || b.addressUa || "",
        }));
        return NextResponse.json({ branches });
      }
    } catch (e) {
      logExternalService("up_branches", {
        success: false,
        latencyMs: Date.now() - start,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return NextResponse.json({
    branches: [],
    fallbackMessage: "Укрпошта API не налаштовано. Вкажіть індекс відділення вручну.",
  });
}

export const GET = withApiLog(upBranchesHandler);
