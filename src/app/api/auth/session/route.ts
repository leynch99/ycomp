import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

/** GET /api/auth/session — returns current user's email and role (for debugging admin access) */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Не залогінені" });
  }
  return NextResponse.json({
    ok: true,
    email: user.email,
    role: user.role,
    hint:
      user.role === "USER"
        ? "Роль USER. Щоб дати адмін-права: Vercel → Storage → ycomp → Query, виконайте: UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'ваш@email.com';"
        : undefined,
  });
}
