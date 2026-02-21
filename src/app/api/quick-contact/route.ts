import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitComposite, normalizePhone } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const phone = String(body?.phone ?? "").trim();
  const { ok: allowed } = await rateLimitComposite(request, "contact", normalizePhone(phone), 5, 3, 60_000);
  if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  const question = String(body?.question ?? "").trim().slice(0, 2000);
  if (!phone || !question) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const record = await prisma.contactRequest.create({
    data: { phone: phone.slice(0, 50), question },
  });
  return NextResponse.json({ id: record.id });
}
