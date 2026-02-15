import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const banners = await prisma.banner.findMany({
    orderBy: [{ type: "asc" }, { position: "asc" }],
  });
  return NextResponse.json({ banners });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const banner = await prisma.banner.create({
    data: {
      type: body.type ?? "tile",
      title: body.title,
      subtitle: body.subtitle || null,
      imageUrl: body.imageUrl,
      linkUrl: body.linkUrl,
      position: body.position !== undefined ? Number(body.position) : 0,
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json({ id: banner.id });
}
