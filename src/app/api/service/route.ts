import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { ok: allowed } = await rateLimit(`service:${ip}`, 3, 60_000);
  if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const body = await request.json();
  const serviceType = String(body?.serviceType ?? "").trim().slice(0, 100);
  const contacts = String(body?.contacts ?? "").trim().slice(0, 255);
  const comment = body?.comment ? String(body.comment).trim().slice(0, 1000) : null;
  if (!serviceType || !contacts) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const record = await prisma.serviceRequest.create({
    data: { serviceType, contacts, comment },
  });
  return NextResponse.json({ id: record.id });
}
