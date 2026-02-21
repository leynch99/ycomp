import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimitComposite, normalizePhone } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const contacts = String(body?.contacts ?? "").trim();
  const id = contacts ? (contacts.includes("@") ? contacts.toLowerCase() : normalizePhone(contacts)) : null;
  const { ok: allowed } = await rateLimitComposite(request, "service", id, 3, 3, 60_000);
  if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  const serviceType = String(body?.serviceType ?? "").trim().slice(0, 100);
  const comment = body?.comment ? String(body.comment).trim().slice(0, 1000) : null;
  if (!serviceType || !contacts) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const record = await prisma.serviceRequest.create({
    data: { serviceType, contacts: contacts.slice(0, 255), comment },
  });
  return NextResponse.json({ id: record.id });
}
