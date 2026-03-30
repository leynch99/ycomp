import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/jwt";
import { SESSION_COOKIE } from "@/lib/session";

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};

/**
 * CSRF: reject mutating requests whose Origin doesn't match our host.
 * Browsers always send Origin on POST/PUT/PATCH/DELETE cross-origin requests.
 */
function csrfOk(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const origin = request.headers.get("origin");
  if (!origin) return true; // server-to-server or same-origin (no origin header)

  const host = request.headers.get("host");
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  let res = NextResponse.next();
  const path = request.nextUrl.pathname;

  // --- API routes: CSRF check ---
  if (path.startsWith("/api/")) {
    if (!csrfOk(request)) {
      return NextResponse.json(
        { error: "CSRF check failed" },
        { status: 403 }
      );
    }
  }

  // --- Admin routes: verify JWT + ADMIN role ---
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/account", request.url));
    }
    try {
      const payload = await verifySession(token);
      if (payload.role !== "ADMIN") {
        if (path.startsWith("/api/")) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/account", request.url));
      }
    } catch {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // --- API routes: add requestId ---
  if (path.startsWith("/api/")) {
    const requestId = crypto.randomUUID();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-request-id", requestId);
    res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("x-request-id", requestId);
  }

  return res;
}

