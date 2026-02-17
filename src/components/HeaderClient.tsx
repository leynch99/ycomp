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

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
} | null;

export function HeaderClient({
  categories,
  lang,
  user,
}: {
  categories: Category[];
  lang: Lang;
  user?: User;
}) {
  const { items: cartItems } = useCart();
  const { items: wishItems } = useWishlist();
  const { items: compareItems } = useCompare();
  const [openCatalog, setOpenCatalog] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
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

  // Close menus on route change / escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenCatalog(false);
        setMobileMenu(false);
        setMobileSearch(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenu]);

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
      {/* Catalog button */}
      <div className="relative hidden sm:block">
        <button
          onClick={() => setOpenCatalog((v) => !v)}
          className="rounded-full border border-lilac px-4 py-2 text-xs text-slate-700 hover:border-[var(--lilac-500)]"
        >
          {t(lang, "catalog")}
        </button>
        {openCatalog && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpenCatalog(false)} />
            <div className="absolute left-0 top-12 z-40 w-72 rounded-2xl border bg-white p-4 shadow-lg">
              <div className="grid gap-2 text-sm">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/c/${cat.slug}`}
                    onClick={() => setOpenCatalog(false)}
                    className="rounded-lg px-2 py-1 hover:bg-slate-50"
                  >
                    {cat.name}
                  </Link>
                ))}
                <Link href="/catalog" className="mt-2 text-xs text-slate-500" onClick={() => setOpenCatalog(false)}>
                  Переглянути всі категорії
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Desktop search */}
      <div className="relative hidden flex-1 sm:block">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
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

      {/* Desktop lang switcher */}
      <div className="ml-2 hidden items-center gap-2 text-xs sm:flex">
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

      {/* Desktop icon links */}
      <div className="ml-2 hidden items-center gap-2 text-xs sm:flex">
        <IconLink href="/wishlist" label={t(lang, "wishlist")} badge={wishItems.length} icon="♥" />
        <IconLink href="/compare" label={t(lang, "compare")} badge={compareItems.length} icon="⇄" />
        <IconLink href="/cart" label={t(lang, "cart")} badge={cartItems.length} icon="🛒" />
        {user ? (
          <>
            <Link
              href="/account"
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-[var(--lilac-500)] hover:text-[var(--lilac-900)]"
            >
              {user.name || user.email}
            </Link>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-[var(--lilac-500)] hover:text-[var(--lilac-900)]"
            >
              Вийти
            </button>
          </>
        ) : (
          <Link
            href="/account"
            className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 hover:border-[var(--lilac-500)] hover:text-[var(--lilac-900)]"
          >
            {t(lang, "account")}
          </Link>
        )}
      </div>

      {/* Mobile action bar */}
      <div className="ml-auto flex items-center gap-1 sm:hidden">
        {/* Mobile search toggle */}
        <button
          onClick={() => setMobileSearch((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
          aria-label="Пошук"
        >
          <SearchIcon />
        </button>
        {/* Mobile cart */}
        <Link
          href="/cart"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600"
          aria-label="Кошик"
        >
          <span className="text-[14px]">🛒</span>
          {cartItems.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 rounded-full bg-lilac px-1 py-0.5 text-[9px] leading-none text-white">
              {cartItems.length}
            </span>
          )}
        </Link>
        {/* Hamburger */}
        <button
          onClick={() => setMobileMenu((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700"
          aria-label="Меню"
        >
          {mobileMenu ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile search bar (slides down) */}
      {mobileSearch && (
        <div className="absolute left-0 right-0 top-full z-50 border-b bg-white px-3 py-3 shadow-md sm:hidden">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`${t(lang, "search")}...`}
              autoFocus
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:border-[var(--lilac-500)] focus:outline-none"
            />
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-12 z-40 rounded-2xl border bg-white p-2 text-sm shadow-lg">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/c/${item.slug}`}
                    onClick={() => setMobileSearch(false)}
                    className="block rounded-lg px-3 py-2 hover:bg-slate-50"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile slide-out menu */}
      {mobileMenu && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={() => setMobileMenu(false)} />
          <div className="fixed inset-y-0 right-0 z-50 w-[280px] overflow-y-auto bg-white px-5 py-6 shadow-xl sm:hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">Меню</span>
              <button onClick={() => setMobileMenu(false)} className="text-slate-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Categories */}
            <div className="mt-6">
              <div className="text-[10px] uppercase tracking-widest text-slate-400">Категорії</div>
              <div className="mt-2 space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/c/${cat.slug}`}
                    onClick={() => setMobileMenu(false)}
                    className="block rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-[var(--lilac-50)]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <div className="mt-6 space-y-1">
              <div className="text-[10px] uppercase tracking-widest text-slate-400">Сервіси</div>
              {[
                ["/deals", t(lang, "deals")],
                ["/outlet", t(lang, "outlet")],
                ["/trade-in", t(lang, "tradeIn")],
                ["/service", t(lang, "service")],
                ["/configurator", t(lang, "configurator")],
                ["/blog", t(lang, "blog")],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenu(false)}
                  className="block rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-[var(--lilac-50)]"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Quick actions */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <Link href="/wishlist" onClick={() => setMobileMenu(false)} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-slate-600">
                <span className="text-base">♥</span>
                <span className="text-[10px]">{t(lang, "wishlist")}</span>
                {wishItems.length > 0 && <span className="rounded-full bg-lilac px-1.5 text-[9px] text-white">{wishItems.length}</span>}
              </Link>
              <Link href="/compare" onClick={() => setMobileMenu(false)} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-slate-600">
                <span className="text-base">⇄</span>
                <span className="text-[10px]">{t(lang, "compare")}</span>
                {compareItems.length > 0 && <span className="rounded-full bg-lilac px-1.5 text-[9px] text-white">{compareItems.length}</span>}
              </Link>
              <Link href="/account" onClick={() => setMobileMenu(false)} className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-slate-600">
                <span className="text-base">👤</span>
                <span className="text-[10px]">{user ? (user.name || "Профіль") : t(lang, "account")}</span>
              </Link>
              {user && (
                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenu(false);
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/";
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-slate-600"
                >
                  <span className="text-base">→</span>
                  <span className="text-[10px]">Вийти</span>
                </button>
              )}
            </div>

            {/* Lang */}
            <div className="mt-6 flex gap-2">
              <button
                className={`flex-1 rounded-full px-3 py-2 text-xs ${lang === "ua" ? "bg-lilac text-white" : "border border-slate-200 text-slate-600"}`}
                onClick={() => switchLang("ua")}
              >
                UA
              </button>
              <button
                className={`flex-1 rounded-full px-3 py-2 text-xs ${lang === "ru" ? "bg-lilac text-white" : "border border-slate-200 text-slate-600"}`}
                onClick={() => switchLang("ru")}
              >
                RU
              </button>
            </div>

            {/* Contact */}
            <div className="mt-6">
              <Link
                href="/contacts"
                onClick={() => setMobileMenu(false)}
                className="block w-full rounded-full bg-lilac px-4 py-2.5 text-center text-xs text-white"
              >
                {t(lang, "consultation")}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.65" y2="16.65" />
    </svg>
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
