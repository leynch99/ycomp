import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, hashPassword } from "@/lib/auth";
import {
  rateLimitComposite,
  normalizePhone,
  getClientIp,
  recordAuthFailure,
  clearAuthFailures,
  needsChallenge,
  verifyChallenge,
  securityLog,
  securityLog429,
} from "@/lib/rate-limit";
import { withApiLog } from "@/lib/api-with-logging";

async function registerHandler(request: Request) {
  try {
    const body = await request.json();
    const lastName = String(body?.lastName ?? "").trim().slice(0, 50);
    const firstName = String(body?.firstName ?? "").trim().slice(0, 50);
    const phone = String(body?.phone ?? "").trim().slice(0, 20);
    const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 255);
    const password = body?.password;
    const confirmPassword = body?.confirmPassword;
    const challengeId = body?.challengeId;
    const challengeAnswer = body?.challengeAnswer;

    const identifier = email || normalizePhone(phone);
    const ip = getClientIp(request);

    const { ok: allowed } = await rateLimitComposite(request, "register", identifier, 3, 3, 60_000);
    if (!allowed) {
      securityLog429("register", ip, identifier, "register");
      return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
    }

    const mustChallenge = identifier && needsChallenge("register", ip, identifier);
    if (mustChallenge) {
      if (!challengeId || challengeAnswer === undefined || challengeAnswer === "") {
        return NextResponse.json({ error: "require_challenge", challengeRequired: true }, { status: 400 });
      }
      if (!verifyChallenge(challengeId, challengeAnswer)) {
        securityLog("auth_failed", { reason: "challenge_invalid", type: "register" });
        return NextResponse.json({ error: "challenge_invalid" }, { status: 400 });
      }
      clearAuthFailures("register", ip, identifier);
    }

    if (!lastName || !firstName) {
      if (identifier) recordAuthFailure("register", ip, identifier);
      return NextResponse.json({ error: "name_required" }, { status: 400 });
    }
    if (!phone || !/^\+380\d{9}$/.test(phone)) {
      if (identifier) recordAuthFailure("register", ip, identifier);
      return NextResponse.json({ error: "phone_invalid" }, { status: 400 });
    }
    if (!email || !password || typeof password !== "string" || password.length < 6) {
      if (identifier) recordAuthFailure("register", ip, identifier);
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      if (identifier) recordAuthFailure("register", ip, identifier);
      return NextResponse.json({ error: "passwords_mismatch" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const { requireChallenge } = identifier ? recordAuthFailure("register", ip, identifier) : { requireChallenge: false };
      return NextResponse.json(
        requireChallenge ? { error: "exists", challengeRequired: true } : { error: "exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const name = `${lastName} ${firstName}`;
    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone },
    });
    if (identifier) clearAuthFailures("register", ip, identifier);
    await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
    return NextResponse.json({ id: user.id });
  } catch (e) {
    try {
      const { captureException } = await import("@sentry/nextjs");
      captureException(e);
    } catch { /* Sentry not configured */ }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export const POST = withApiLog(registerHandler);
