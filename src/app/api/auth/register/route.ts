import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, hashPassword } from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { ok: allowed } = await rateLimit(`register:${ip}`, 3, 60_000);
    if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

    const body = await request.json();
    const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 255);
    const password = body?.password;
    const name = String(body?.name ?? "").trim().slice(0, 100);
    if (!email || !password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "exists" }, { status: 400 });
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: name || undefined },
    });
    await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
    return NextResponse.json({ id: user.id });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
