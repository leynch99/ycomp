import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "invalid" }, { status: 400 });
  await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
  return NextResponse.json({ id: user.id });
}
