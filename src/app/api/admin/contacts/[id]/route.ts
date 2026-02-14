import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(request: NextRequest, context: { params: any }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json();
  const resolvedParams = await Promise.resolve(context.params);
  await prisma.contactRequest.update({
    where: { id: resolvedParams.id },
    data: { status: body.status ?? "DONE" },
  });
  return NextResponse.json({ ok: true });
}
