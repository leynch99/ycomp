import { cookies } from "next/headers";
import { t } from "@/lib/i18n-shared";
import type { Lang } from "@/lib/i18n-shared";

export { t };
export type { Lang };

export async function getLang(): Promise<Lang> {
  const cookie = (await cookies()).get("lang")?.value;
  return cookie === "ru" ? "ru" : "ua";
}
