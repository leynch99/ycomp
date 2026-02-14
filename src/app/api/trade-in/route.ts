import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const record = await prisma.tradeInRequest.create({
    data: {
      deviceType: body.deviceType,
      model: body.model,
      condition: body.condition,
      photoUrl: body.photoUrl ?? null,
      contacts: body.contacts,
      comment: body.comment ?? null,
    },
  });
  return NextResponse.json({ id: record.id });
}
