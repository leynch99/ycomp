import { NextResponse } from "next/server";
import { trackParcel } from "@/lib/novaposhta";
import { withApiLog } from "@/lib/api-with-logging";

async function trackingHandler(request: Request) {
  const { searchParams } = new URL(request.url);
  const ttn = searchParams.get("ttn");

  if (!ttn) {
    return NextResponse.json({ error: "TTN required" }, { status: 400 });
  }

  try {
    const tracking = await trackParcel(ttn);

    if (!tracking) {
      return NextResponse.json({ error: "Tracking not found" }, { status: 404 });
    }

    return NextResponse.json(tracking);
  } catch (error) {
    console.error("[tracking] Error:", error);
    return NextResponse.json(
      { error: "Failed to track parcel" },
      { status: 500 }
    );
  }
}

export const GET = withApiLog(trackingHandler);
