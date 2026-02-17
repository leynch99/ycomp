import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, verifyPassword } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { ok } = await rateLimit(`login:${ip}`, 5, 60_000);
  if (!ok) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const body = await request.json();
  const email = String(body?.email ?? "").trim().slice(0, 255);
  const password = body?.password;
  if (!email || !password || typeof password !== "string") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
  return NextResponse.json({ id: user.id });
}
