import { getSessionUser } from "@/lib/auth";

export async function requireAdmin() {
  const user = await getSessionUser();
  return user?.role === "ADMIN";
}
