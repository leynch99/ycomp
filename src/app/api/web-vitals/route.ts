import { NextResponse } from "next/server";

type WebVitalsPayload = {
  name: string;
  value: number;
  id: string;
  rating?: string;
  page?: string;
  href?: string;
  device?: string;
};

export async function POST(request: Request) {
  try {
    const payload: WebVitalsPayload = await request.json();

    if (!payload.name || typeof payload.value !== "number") {
      return NextResponse.json({ ok: false, reason: "invalid payload" }, { status: 400 });
    }

    if (process.env.NODE_ENV === "production") {
      console.info(
        "[web-vitals]",
        payload.name,
        payload.value.toFixed(0),
        payload.rating ?? "-",
        payload.page ?? "/",
        payload.device ?? "-"
      );
      // Extend: forward to logging service (Logflare, Datadog, etc.) or store in DB
      // await logToService({ ...payload, timestamp: new Date().toISOString() });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
