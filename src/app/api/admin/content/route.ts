import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const page = await prisma.contentPage.upsert({
    where: { slug: body.slug },
    update: {
      titleUa: body.titleUa,
      titleRu: body.titleRu,
      bodyUa: body.bodyUa ?? "",
      bodyRu: body.bodyRu ?? "",
    },
    create: {
      slug: body.slug,
      titleUa: body.titleUa,
      titleRu: body.titleRu,
      bodyUa: body.bodyUa ?? "",
      bodyRu: body.bodyRu ?? "",
    },
  });
  return NextResponse.json({ id: page.id });
}
