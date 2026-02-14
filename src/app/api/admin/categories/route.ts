import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
    },
  });
  return NextResponse.json({ id: category.id });
}
