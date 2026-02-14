"use client";

import { useRouter } from "next/navigation";

export function LangToggle({ lang }: { lang: "ua" | "ru" }) {
  const router = useRouter();

  const switchLang = async () => {
    const next = lang === "ua" ? "ru" : "ua";
    await fetch("/api/lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lang: next }),
    });
    router.refresh();
  };

  return (
    <button
      onClick={switchLang}
      className="rounded-full border px-3 py-1 text-xs uppercase"
    >
      {lang === "ua" ? "UA" : "RU"}
    </button>
  );
}
