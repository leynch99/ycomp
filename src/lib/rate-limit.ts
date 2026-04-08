/**
 * Rate limiter with IP + email/phone composite limits.
 * Challenge-after-N-failures, security telemetry.
 *
 * Automatically uses Upstash Redis in production if UPSTASH_REDIS_REST_URL
 * and UPSTASH_REDIS_REST_TOKEN are set. Falls back to in-memory for development.
 */

import { Redis } from "@upstash/redis";

export interface RateLimitStore {
  get(key: string): Promise<{ count: number; resetAt: number } | null>;
  set(key: string, data: { count: number; resetAt: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

// --- In-memory store (dev-only fallback) ---
const memoryMap = new Map<string, { count: number; resetAt: number }>();
const inMemoryStore: RateLimitStore = {
  async get(key) { return memoryMap.get(key) ?? null; },
  async set(key, data) { memoryMap.set(key, data); },
  async delete(key) { memoryMap.delete(key); },
};

// --- Upstash Redis store (production) ---
function createUpstashStore(): RateLimitStore | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const redis = new Redis({ url, token });

  return {
    async get(key) {
      try {
        const data = await redis.get<{ count: number; resetAt: number }>(key);
        return data;
      } catch (error) {
        console.error("[rate-limit] Redis get error:", error);
        return null;
      }
    },
    async set(key, data) {
      try {
        const ttlSeconds = Math.ceil((data.resetAt - Date.now()) / 1000);
        if (ttlSeconds > 0) {
          await redis.setex(key, ttlSeconds, data);
        }
      } catch (error) {
        console.error("[rate-limit] Redis set error:", error);
      }
    },
    async delete(key) {
      try {
        await redis.del(key);
      } catch (error) {
        console.error("[rate-limit] Redis delete error:", error);
      }
    },
  };
}

// Auto-configure store based on environment
let activeStore: RateLimitStore = inMemoryStore;

if (typeof process !== "undefined") {
  const upstashStore = createUpstashStore();
  if (upstashStore) {
    activeStore = upstashStore;
    console.log("[rate-limit] ✓ Using Upstash Redis for persistent rate limiting");
  } else if (process.env.NODE_ENV === "production") {
    console.warn(
      "[rate-limit] ⚠️  UPSTASH_REDIS_REST_URL/TOKEN not set. Using in-memory store. " +
      "Rate limits will NOT persist across serverless invocations!"
    );
  } else {
    console.log("[rate-limit] Using in-memory store (development mode)");
  }
}

/** Swap in a custom store (for testing or alternative providers) */
export function setRateLimitStore(store: RateLimitStore) {
  activeStore = store;
}

const failureStore = new Map<string, { count: number; resetAt: number }>();
const challengeStore = new Map<string, { answer: number; resetAt: number }>();
const CLEANUP_INTERVAL = 60_000;
const CHALLENGE_TTL = 5 * 60 * 1000; // 5 min
const FAILURE_THRESHOLD = 3;

let lastCleanup = Date.now();

const securityBuffer: Array<{ t: number; e: string; d: Record<string, unknown> }> = [];
const MAX_BUFFER = 1000;

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  // Note: cleanup only works for in-memory stores (Map-based)
  // For Redis-based stores, use TTL on keys directly
  for (const [key, data] of memoryMap.entries()) {
    if (data.resetAt < now) memoryMap.delete(key);
  }
  for (const [key, data] of failureStore.entries()) {
    if (data.resetAt < now) failureStore.delete(key);
  }
  for (const [key, data] of challengeStore.entries()) {
    if (data.resetAt < now) challengeStore.delete(key);
  }
}

/**
 * Security telemetry: logs events for audit. In production, hook to SIEM/logging.
 */
export function securityLog(event: string, data: Record<string, unknown> = {}) {
  const entry = { t: Date.now(), e: event, d: data };
  securityBuffer.push(entry);
  if (securityBuffer.length > MAX_BUFFER) securityBuffer.shift();
  const logData = { ...data, event };
  if (process.env.NODE_ENV === "development") {
    console.warn("[security]", logData);
  }
}

/** Log 429 with full context for brute-force analysis */
export function securityLog429(
  prefix: string,
  ip: string,
  identifier: string | null,
  endpoint: string
) {
  securityLog("security_429", { prefix, ip: ip.slice(0, 16), id: identifier?.slice(0, 8), endpoint });
}

/** Log brute-force pattern: many failures for same target or from same IP */
export function securityLogBruteForce(
  pattern: "same_target_multi_ip" | "same_ip_multi_target" | "repeated_failures",
  data: Record<string, unknown>
) {
  securityLog("brute_force", { pattern, ...data });
}

/** Record auth failure, return whether challenge is now required */
export function recordAuthFailure(
  prefix: string,
  ip: string,
  identifier: string
): { failures: number; requireChallenge: boolean } {
  cleanup();
  const now = Date.now();
  const key = `${prefix}:fail:${ip}:${identifier}`;
  const entry = failureStore.get(key);

  if (!entry || entry.resetAt < now) {
    failureStore.set(key, { count: 1, resetAt: now + 60_000 });
    return { failures: 1, requireChallenge: false };
  }
  entry.count++;
  const requireChallenge = entry.count >= FAILURE_THRESHOLD;
  if (requireChallenge && entry.count === FAILURE_THRESHOLD) {
    securityLogBruteForce("repeated_failures", {
      prefix,
      ip: ip.slice(0, 12),
      id: identifier.slice(0, 8),
      count: entry.count,
    });
  }
  return { failures: entry.count, requireChallenge };
}

export function getAuthFailures(prefix: string, ip: string, identifier: string): number {
  const key = `${prefix}:fail:${ip}:${identifier}`;
  const entry = failureStore.get(key);
  if (!entry || entry.resetAt < Date.now()) return 0;
  return entry.count;
}

export function clearAuthFailures(prefix: string, ip: string, identifier: string) {
  failureStore.delete(`${prefix}:fail:${ip}:${identifier}`);
}

export function needsChallenge(prefix: string, ip: string, identifier: string): boolean {
  return getAuthFailures(prefix, ip, identifier) >= FAILURE_THRESHOLD;
}

/** Create a challenge, returns { id, question } */
export function createChallenge(): { id: string; question: string } {
  cleanup();
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  challengeStore.set(id, { answer: a + b, resetAt: Date.now() + CHALLENGE_TTL });
  return { id, question: `Скільки буде ${a} + ${b}?` };
}

/** Verify challenge, consumes it on success */
export function verifyChallenge(id: string, answer: string | number): boolean {
  cleanup();
  const entry = challengeStore.get(id);
  if (!entry || entry.resetAt < Date.now()) return false;
  const expected = entry.answer;
  const got = typeof answer === "string" ? parseInt(answer, 10) : answer;
  challengeStore.delete(id);
  return !Number.isNaN(got) && got === expected;
}

export async function rateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): Promise<{ ok: boolean; remaining: number }> {
  cleanup();
  const now = Date.now();
  const entry = await activeStore.get(identifier);

  if (!entry) {
    await activeStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  if (entry.resetAt < now) {
    await activeStore.set(identifier, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  await activeStore.set(identifier, entry);
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
    securityLog429(prefix, ip, identifier ?? null, prefix);
    return { ok: false };
  }
  if (identifier) {
    const idKey = `${identifier}`.trim().toLowerCase().slice(0, 64);
    const idResult = await rateLimit(`${prefix}:id:${idKey}`, idLimit, windowMs);
    if (!idResult.ok) {
      securityLog("rate_limit", { prefix, by: "identifier", id: idKey.slice(0, 8) });
      securityLog429(prefix, ip, idKey, prefix);
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
