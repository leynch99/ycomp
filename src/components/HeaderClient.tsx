"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useCompare } from "@/components/providers/CompareProvider";
import { Lang, t } from "@/lib/i18n-shared";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export function HeaderClient({
  categories,
  lang,
}: {
  categories: Category[];
  lang: Lang;
}) {
  const { items: cartItems } = useCart();
  const { items: wishItems } = useWishlist();
  const { items: compareItems } = useCompare();
  const [openCatalog, setOpenCatalog] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Category[]>([]);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { suggestions: Category[] };
      setSuggestions(data.suggestions ?? []);
    }, 250);
    return () => clearTimeout(id);
  }, [query]);

  const switchLang = async (next: Lang) => {
    await fetch("/api/lang", {
      method: "POST",
      body: JSON.stringify({ lang: next }),
      headers: { "Content-Type": "application/json" },
    });
    window.location.reload();
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpenCatalog((v) => !v)}
          className="rounded-full border border-lilac px-3 py-1 text-[11px] text-slate-700 hover:border-[var(--lilac-500)] sm:px-4 sm:py-2 sm:text-xs"
        >
          {t(lang, "catalog")}
        </button>
        {openCatalog && (
          <div className="absolute left-0 top-12 z-40 w-72 rounded-2xl border bg-white p-4 shadow-lg">
            <div className="grid gap-2 text-sm">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/c/${cat.slug}`}
                  className="rounded-lg px-2 py-1 hover:bg-slate-50"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/catalog" className="mt-2 text-xs text-slate-500">
                Переглянути всі категорії
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="relative hidden flex-1 sm:block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="20" y1="20" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`${t(lang, "search")}...`}
          className="w-full rounded-full border border-slate-200 bg-white px-9 py-2 text-xs text-slate-700 focus:border-[var(--lilac-500)] focus:outline-none"
        />
        {suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-11 z-40 rounded-2xl border bg-white p-2 text-sm shadow-lg">
            {suggestions.map((item) => (
              <Link
                key={item.id}
                href={`/c/${item.slug}`}
                className="block rounded-lg px-3 py-2 hover:bg-slate-50"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="ml-2 flex items-center gap-2 text-xs">
        <button
          className={`rounded-full px-3 py-1 ${
            lang === "ua" ? "bg-lilac text-white" : "border border-slate-200 text-slate-600"
          }`}
          onClick={() => switchLang("ua")}
        >
          UA
        </button>
        <button
          className={`rounded-full px-3 py-1 ${
            lang === "ru" ? "bg-lilac text-white" : "border border-slate-200 text-slate-600"
          }`}
          onClick={() => switchLang("ru")}
        >
          RU
        </button>
      </div>
      <div className="ml-2 flex items-center gap-2 text-xs">
        <IconLink href="/wishlist" label={t(lang, "wishlist")} badge={wishItems.length} icon="♥" />
        <IconLink href="/compare" label={t(lang, "compare")} badge={compareItems.length} icon="⇄" />
        <IconLink href="/cart" label={t(lang, "cart")} badge={cartItems.length} icon="🛒" />
        <Link
          href="/account"
          className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-[var(--lilac-500)] hover:text-[var(--lilac-900)]"
        >
          {t(lang, "account")}
        </Link>
      </div>
    </>
  );
}

function IconLink({
  href,
  label,
  badge,
  icon,
}: {
  href: string;
  label: string;
  badge: number;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-[12px] text-slate-600 hover:border-[var(--lilac-500)] hover:text-[var(--lilac-900)]"
      title={label}
      aria-label={label}
    >
      {icon}
      {badge > 0 && (
        <span className="absolute -right-1.5 -top-1.5 rounded-full bg-lilac px-1.5 py-0.5 text-[10px] text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
