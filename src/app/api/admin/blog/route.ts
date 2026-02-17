import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const slug = String(body.slug ?? "").trim().toLowerCase().replace(/\s+/g, "-");
  if (!slug || !body.title || !body.body) {
    return NextResponse.json({ error: "slug, title, body required" }, { status: 400 });
  }
  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: body.title,
      excerpt: body.excerpt?.trim() || null,
      body: body.body,
      imageUrl: body.imageUrl?.trim() || null,
      isPublished: body.isPublished ?? true,
    },
  });
  return NextResponse.json({ id: post.id });
}
