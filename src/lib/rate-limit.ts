/**
 * In-memory rate limiter with IP + email/phone composite limits.
 * Security telemetry for audit trail.
 */

const store = new Map<string, { count: number; resetAt: number }>();
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

const securityBuffer: Array<{ t: number; e: string; d: Record<string, unknown> }> = [];
const MAX_BUFFER = 500;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, data] of store.entries()) {
    if (data.resetAt < now) store.delete(key);
  }
}

/**
 * Security telemetry: logs events for audit. In production, hook to SIEM/logging.
 */
export function securityLog(event: string, data: Record<string, unknown> = {}) {
  const entry = { t: Date.now(), e: event, d: data };
  securityBuffer.push(entry);
  if (securityBuffer.length > MAX_BUFFER) securityBuffer.shift();
  if (process.env.NODE_ENV === "development") {
    console.warn("[security]", event, data);
  }
}

export async function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): Promise<{ ok: boolean; remaining: number }> {
  cleanup();
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  if (entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    securityLog("rate_limit_hit", { key: identifier.slice(0, 32), count: entry.count });
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining: maxRequests - entry.count };
}

/**
 * Composite rate limit: requires BOTH IP and identifier (email/phone) to be under limit.
 */
export async function rateLimitComposite(
  request: Request,
  prefix: string,
  identifier: string | null | undefined,
  ipLimit: number,
  idLimit: number,
  windowMs: number = 60_000
): Promise<{ ok: boolean }> {
  const ip = getClientIp(request);
  const ipResult = await rateLimit(`${prefix}:ip:${ip}`, ipLimit, windowMs);
  if (!ipResult.ok) {
    securityLog("rate_limit", { prefix, by: "ip", ip: ip.slice(0, 12) });
    return { ok: false };
  }
  if (identifier) {
    const idKey = `${identifier}`.trim().toLowerCase().slice(0, 64);
    const idResult = await rateLimit(`${prefix}:id:${idKey}`, idLimit, windowMs);
    if (!idResult.ok) {
      securityLog("rate_limit", { prefix, by: "identifier" });
      return { ok: false };
    }
  }
  return { ok: true };
}

/** Normalize phone for rate-limit key (last 9 digits). */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-9) || phone;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  return "unknown";
}
