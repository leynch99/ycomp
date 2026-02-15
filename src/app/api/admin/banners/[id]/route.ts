import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(request: NextRequest, context: { params: any }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const resolvedParams = await Promise.resolve(context.params);
  const body = await request.json();

  await prisma.banner.update({
    where: { id: resolvedParams.id },
    data: {
      type: body.type !== undefined ? body.type : undefined,
      title: body.title !== undefined ? body.title : undefined,
      subtitle: body.subtitle !== undefined ? (body.subtitle || null) : undefined,
      imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
      linkUrl: body.linkUrl !== undefined ? body.linkUrl : undefined,
      position: body.position !== undefined ? Number(body.position) : undefined,
      isActive: body.isActive !== undefined ? body.isActive : undefined,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, context: { params: any }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const resolvedParams = await Promise.resolve(context.params);
  await prisma.banner.delete({ where: { id: resolvedParams.id } });
  return NextResponse.json({ ok: true });
}
