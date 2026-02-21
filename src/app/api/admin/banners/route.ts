import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { withApiLog } from "@/lib/api-with-logging";

async function getBanners() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const banners = await prisma.banner.findMany({
    orderBy: [{ type: "asc" }, { position: "asc" }],
  });
  return NextResponse.json({ banners });
}

async function getBannersHandler(_request: Request) {
  return getBanners();
}

export const GET = withApiLog(getBannersHandler);

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
