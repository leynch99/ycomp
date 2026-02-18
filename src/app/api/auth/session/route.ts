import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** GET /api/auth/session — returns current user's email and role (for debugging admin access) */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Не залогінені" });
  }

  // Verify role directly from DB (in case DATABASE_URL points to different DB than Neon SQL Editor)
  const rawUser = await prisma.$queryRaw<{ role: string }[]>`
    SELECT role FROM "User" WHERE id = ${user.id}
  `;
  const dbRole = rawUser[0]?.role ?? null;

  const url = process.env.DATABASE_URL ?? "";
  const dbHost = url.match(/@([^/:]+)/)?.[1] ?? "?";

  return NextResponse.json({
    ok: true,
    email: user.email,
    role: user.role,
    dbRoleDirect: dbRole,
    dbHost,
    hint:
      user.role === "USER"
        ? "Роль USER. Перевір: DATABASE_URL в Vercel вказує на той самий Neon, де ти виконав UPDATE? Vercel → Settings → Env → DATABASE_URL — порівняй хост з Neon."
        : undefined,
  });
}
