import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, verifyPassword } from "@/lib/auth";
import {
  rateLimitComposite,
  securityLog,
  getClientIp,
  recordAuthFailure,
  clearAuthFailures,
  needsChallenge,
  verifyChallenge,
  securityLog429,
} from "@/lib/rate-limit";
import { withApiLog } from "@/lib/api-with-logging";

async function loginHandler(request: Request) {
  const body = await request.json();
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 255);
  const password = body?.password;
  const challengeId = body?.challengeId;
  const challengeAnswer = body?.challengeAnswer;

  const ip = getClientIp(request);

  // Rate limit (IP + email)
  const { ok: allowed } = await rateLimitComposite(request, "login", email, 5, 5, 60_000);
  if (!allowed) {
    securityLog429("login", ip, email, "login");
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  }

  if (!email || !password || typeof password !== "string") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // Check if challenge required (after N failures)
  const mustChallenge = needsChallenge("login", ip, email);
  if (mustChallenge) {
    if (!challengeId || challengeAnswer === undefined || challengeAnswer === "") {
      return NextResponse.json({ error: "require_challenge", challengeRequired: true }, { status: 400 });
    }
    if (!verifyChallenge(challengeId, challengeAnswer)) {
      securityLog("auth_failed", { reason: "challenge_invalid", email: email.slice(0, 8) });
      return NextResponse.json({ error: "challenge_invalid" }, { status: 400 });
    }
    clearAuthFailures("login", ip, email);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const { requireChallenge } = recordAuthFailure("login", ip, email);
    securityLog("auth_failed", { reason: "user_not_found", email: email.slice(0, 8), ip: ip.slice(0, 12) });
    return NextResponse.json(
      requireChallenge ? { error: "invalid", challengeRequired: true } : { error: "invalid" },
      { status: 400 }
    );
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const { requireChallenge } = recordAuthFailure("login", ip, email);
    securityLog("auth_failed", { reason: "bad_password", email: email.slice(0, 8), ip: ip.slice(0, 12) });
    return NextResponse.json(
      requireChallenge ? { error: "invalid", challengeRequired: true } : { error: "invalid" },
      { status: 400 }
    );
  }

  clearAuthFailures("login", ip, email);
  await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
  return NextResponse.json({ id: user.id });
}

export const POST = withApiLog(loginHandler);
