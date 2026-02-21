/**
 * Wraps API route handlers with structured logging (requestId, route, status, latency).
 * Usage: export const GET = withApiLog(async (req, ctx) => { ... });
 */
import { NextResponse } from "next/server";
import { logApi } from "./logger";

const REQUEST_ID_HEADER = "x-request-id";

function getRequestId(request: Request): string {
  return request.headers.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function withApiLog<
  T extends (request: Request, context?: unknown) => Promise<Response | NextResponse>,
>(handler: T): T {
  return (async (request: Request, context?: unknown) => {
    const requestId = getRequestId(request);
    const start = Date.now();
    const url = new URL(request.url);
    const route = url.pathname;
    const method = request.method;

    try {
      const response = await handler(request, context);
      const latencyMs = Date.now() - start;
      const status = response.status;

      logApi({
        requestId,
        route,
        method,
        status,
        latencyMs,
        ip: getClientIp(request),
      });

      const headers = new Headers(response.headers);
      if (!headers.has(REQUEST_ID_HEADER)) {
        headers.set(REQUEST_ID_HEADER, requestId);
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    } catch (err) {
      const latencyMs = Date.now() - start;
      logApi({
        requestId,
        route,
        method,
        status: 500,
        latencyMs,
        ip: getClientIp(request),
      });
      throw err;
    }
  }) as T;
}
