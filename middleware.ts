import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/jwt";
import { SESSION_COOKIE } from "@/lib/session";

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const requestId = crypto.randomUUID();
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-request-id", requestId);
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/account", request.url));
  }
  try {
    await verifySession(token);
    // Role check moved to admin layout — uses fresh DB data so promotion takes effect immediately
  } catch {
    return NextResponse.redirect(new URL("/account", request.url));
  }
  return NextResponse.next();
}
