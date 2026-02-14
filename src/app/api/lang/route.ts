import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { lang } = await request.json();
  const value = lang === "ru" ? "ru" : "ua";
  const response = NextResponse.json({ ok: true });
  response.cookies.set("lang", value, {
    path: "/",
    sameSite: "lax",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
