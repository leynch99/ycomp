import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const supplier = await prisma.supplier.create({
    data: {
      name: body.name,
      slug: body.slug,
      email: body.email ?? null,
      phone: body.phone ?? null,
    },
  });
  return NextResponse.json({ id: supplier.id });
}
