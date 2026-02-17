import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { ok: allowed } = await rateLimit(`tradein:${ip}`, 3, 60_000);
  if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const body = await request.json();
  const deviceType = String(body?.deviceType ?? "").trim().slice(0, 100);
  const model = String(body?.model ?? "").trim().slice(0, 200);
  const condition = String(body?.condition ?? "").trim().slice(0, 100);
  const contacts = String(body?.contacts ?? "").trim().slice(0, 255);
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
