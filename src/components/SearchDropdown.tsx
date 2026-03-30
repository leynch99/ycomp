"use client";

import Link from "next/link";

type SearchItem = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  salePrice: number;
  image: string | null;
};

type SearchHints = {
  categories: { id: string; name: string; slug: string }[];
  brands: string[];
};

export function SearchDropdown({
  items,
  hints,
  query,
  onLinkClick,
}: {
  items: SearchItem[];
  hints: SearchHints | null;
  query: string;
  onLinkClick?: () => void;
}) {
  if (items.length === 0 && !hints) return null;

  return (
    <div className="absolute left-0 right-0 top-11 z-40 max-h-80 overflow-y-auto rounded-2xl border bg-white p-2 text-sm shadow-lg">
      {items.length > 0 && (
        <>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Товари</div>
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/p/${p.slug}`}
              onClick={onLinkClick}
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 hover:bg-slate-50"
            >
              <div className="min-w-0">
                <span className="truncate">{p.name}</span>
                {p.brand && <span className="block text-[11px] text-slate-500">{p.brand}</span>}
              </div>
              <span className="shrink-0 font-medium text-slate-600">{p.salePrice.toLocaleString("uk-UA")} ₴</span>
            </Link>
          ))}
        </>
      )}
      {items.length === 0 && hints && (
        <>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Спробуйте категорії або бренди
          </div>
          {hints.categories.length > 0 && (
            <div className="mb-2">
              <span className="text-[11px] text-slate-400">Категорії:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {hints.categories.map((c) => (
                  <Link key={c.id} href={`/c/${c.slug}`} onClick={onLinkClick} className="rounded-full border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {hints.brands.length > 0 && (
            <div>
              <span className="text-[11px] text-slate-400">Бренди:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {hints.brands.map((b) => (
                  <Link key={b} href={`/catalog?brand=${encodeURIComponent(b)}`} onClick={onLinkClick} className="rounded-full border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50">
                    {b}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <Link
        href={`/catalog?q=${encodeURIComponent(query)}`}
        onClick={onLinkClick}
        className="mt-2 block rounded-lg border-t border-slate-100 px-3 py-2 text-center text-xs text-lilac hover:bg-[var(--lilac-50)]"
      >
        Всі результати →
      </Link>
    </div>
  );
}
