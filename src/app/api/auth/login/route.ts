import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, verifyPassword } from "@/lib/auth";
import { rateLimitComposite, securityLog } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 255);
  const { ok: allowed } = await rateLimitComposite(request, "login", email, 5, 5, 60_000);
  if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  const password = body?.password;
  if (!email || !password || typeof password !== "string") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    securityLog("auth_failed", { reason: "user_not_found", email: email.slice(0, 8) });
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    securityLog("auth_failed", { reason: "bad_password", email: email.slice(0, 8) });
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
  return NextResponse.json({ id: user.id });
}
