import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/rate-limit";

export async function GET() {
  const { id, question } = createChallenge();
  return NextResponse.json({ id, question });
}
