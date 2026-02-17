import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { ok: allowed } = await rateLimit(`contact:${ip}`, 5, 60_000);
  if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const body = await request.json();
  const phone = String(body?.phone ?? "").trim().slice(0, 50);
  const question = String(body?.question ?? "").trim().slice(0, 2000);
  if (!phone || !question) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const record = await prisma.contactRequest.create({
    data: { phone, question },
  });
  return NextResponse.json({ id: record.id });
}
