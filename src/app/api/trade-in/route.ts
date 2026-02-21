import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitComposite, normalizePhone } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const contacts = String(body?.contacts ?? "").trim().slice(0, 255);
  const id = contacts ? (contacts.includes("@") ? contacts.toLowerCase() : normalizePhone(contacts)) : null;
  const { ok: allowed } = await rateLimitComposite(request, "tradein", id, 3, 3, 60_000);
  if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  const deviceType = String(body?.deviceType ?? "").trim().slice(0, 100);
  const model = String(body?.model ?? "").trim().slice(0, 200);
  const condition = String(body?.condition ?? "").trim().slice(0, 100);
  const photoUrl = body?.photoUrl ? String(body.photoUrl).slice(0, 500) : null;
  const comment = body?.comment ? String(body.comment).trim().slice(0, 1000) : null;
  if (!deviceType || !model || !condition || !contacts) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const record = await prisma.tradeInRequest.create({
    data: { deviceType, model, condition, contacts, photoUrl, comment },
  });
  return NextResponse.json({ id: record.id });
}
