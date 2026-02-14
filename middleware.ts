import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/jwt";
import { SESSION_COOKIE } from "@/lib/session";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/account", request.url));
  }
  try {
    const payload = await verifySession(token);
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/account", request.url));
  }
  return NextResponse.next();
}
