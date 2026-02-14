import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json();
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const resolvedParams = await params;
  await prisma.supplierPayout.update({
    where: { id: resolvedParams.id },
    data: { status: body.status ?? "PAID", paidAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
