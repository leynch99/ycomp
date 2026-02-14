import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const record = await prisma.serviceRequest.create({
    data: {
      serviceType: body.serviceType,
      contacts: body.contacts,
      comment: body.comment ?? null,
    },
  });
  return NextResponse.json({ id: record.id });
}
