import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ defaults: null });

  const lastOrder = await prisma.order.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      customerName: true,
      phone: true,
      email: true,
      city: true,
      npBranch: true,
      paymentMethod: true,
    },
  });

  const defaults = {
    name: lastOrder?.customerName ?? user.name ?? "",
    phone: lastOrder?.phone ?? user.phone ?? "",
    email: lastOrder?.email ?? user.email ?? "",
    city: lastOrder?.city ?? "",
    npBranch: lastOrder?.npBranch ?? "",
    paymentMethod: lastOrder?.paymentMethod ?? "online",
  };

  return NextResponse.json({ defaults });
}
