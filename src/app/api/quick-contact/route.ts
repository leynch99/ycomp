import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const record = await prisma.contactRequest.create({
    data: {
      phone: body.phone,
      question: body.question,
    },
  });
  return NextResponse.json({ id: record.id });
}
