import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(request: NextRequest, context: { params: any }) {
  const body = await request.json();
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const resolvedParams = await Promise.resolve(context.params);
  await prisma.supplierPayout.update({
    where: { id: resolvedParams.id },
    data: { status: (body.status ?? "PAID") as string, paidAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
