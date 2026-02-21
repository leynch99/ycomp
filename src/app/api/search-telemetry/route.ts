import { NextResponse } from "next/server";
import { emitSearchEvent } from "@/lib/search-telemetry";

const ALLOWED = ["search_select", "search_submit_all_results"] as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body?.name;
    if (!name || !ALLOWED.includes(name)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const payload: Record<string, unknown> = { ...body };
    delete payload.name;
    emitSearchEvent(name, payload);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
