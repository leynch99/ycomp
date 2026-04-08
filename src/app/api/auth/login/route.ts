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
import { emitSecurityEvent, maskEmail } from "@/lib/security-telemetry";
import { validateRequest, loginSchema } from "@/lib/validation";

async function loginHandler(request: Request) {
  // Validate request body
  const validation = await validateRequest(request, loginSchema);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { email, password, challengeId, challengeAnswer } = validation.data;

  const ip = getClientIp(request);
  emitSecurityEvent("auth_attempt", { ip: ip.slice(0, 12), email: maskEmail(email) });

  const { ok: allowed } = await rateLimitComposite(request, "login", email, 5, 5, 60_000);
  if (!allowed) {
    securityLog429("login", ip, email, "login");
    emitSecurityEvent("rate_limit_block", { ip: ip.slice(0, 12), endpoint: "login" });
    return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });
  }

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
  await createSessionCookie({ userId: user.id, role: user.role as "ADMIN" | "USER", email: user.email });
  emitSecurityEvent("auth_success", { ip: ip.slice(0, 12), email: maskEmail(email) });
  return NextResponse.json({ id: user.id });
}

export const POST = withApiLog(loginHandler);
