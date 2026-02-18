import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const name = body.name ? String(body.name).trim().slice(0, 100) : undefined;
  const phone = body.phone ? String(body.phone).trim().slice(0, 20) : null;
  const birthDate = body.birthDate ? new Date(body.birthDate) : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      phone,
      birthDate: birthDate && !isNaN(birthDate.getTime()) ? birthDate : null,
    },
  });

  return NextResponse.json({ ok: true });
}
