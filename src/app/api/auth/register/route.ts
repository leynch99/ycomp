import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionCookie, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return NextResponse.json({ error: "exists" }, { status: 400 });
  const passwordHash = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: { email: body.email, passwordHash, name: body.name },
  });
  await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
  return NextResponse.json({ id: user.id });
}
