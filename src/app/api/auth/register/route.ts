import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, hashPassword } from "@/lib/auth";
import { rateLimitComposite, normalizePhone } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lastName = String(body?.lastName ?? "").trim().slice(0, 50);
    const firstName = String(body?.firstName ?? "").trim().slice(0, 50);
    const phone = String(body?.phone ?? "").trim().slice(0, 20);
    const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 255);
    const password = body?.password;
    const confirmPassword = body?.confirmPassword;

    const { ok: allowed } = await rateLimitComposite(request, "register", email || normalizePhone(phone), 3, 3, 60_000);
    if (!allowed) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

    if (!lastName || !firstName) {
      return NextResponse.json({ error: "name_required" }, { status: 400 });
    }
    if (!phone || !/^\+380\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "phone_invalid" }, { status: 400 });
    }
    if (!email || !password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "passwords_mismatch" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "exists" }, { status: 400 });

    const passwordHash = await hashPassword(password);
    const name = `${lastName} ${firstName}`;
    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone },
    });
    await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
    return NextResponse.json({ id: user.id });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
