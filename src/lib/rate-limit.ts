/**
 * Simple in-memory rate limiter.
 * Limits requests per IP per window. Works per serverless instance.
 */

const store = new Map<string, { count: number; resetAt: number }>();
const CLEANUP_INTERVAL = 60_000; // 1 min
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, data] of store.entries()) {
    if (data.resetAt < now) store.delete(key);
  }
}

export async function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): Promise<{ ok: boolean; remaining: number }> {
  cleanup();
  const now = Date.now();
  const key = identifier;
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  if (entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { ok: false, remaining: 0 };
  }
  return { ok: true, remaining: maxRequests - entry.count };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIp) return realIp;
  return "unknown";
}
