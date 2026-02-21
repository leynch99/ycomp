"use client";

import { useEffect, useState } from "react";
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

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [hints, setHints] = useState<SearchHints | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setItems([]);
      setHints(null);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { items?: SearchItem[]; hints?: SearchHints | null };
      setItems(data.items ?? []);
      setHints(data.hints ?? null);
      setOpen(true);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const hasContent = items.length > 0 || hints;

  return (
    <div className="relative w-full max-w-lg">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Пошук товарів"
        className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-slate-400"
      />
      {open && hasContent && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border bg-white p-2 shadow-xl">
          {items.length > 0 && (
            <>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Товари</div>
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/p/${item.slug}`}
                  className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  <div className="min-w-0">
                    <span className="line-clamp-1">{item.name}</span>
                    {item.brand && (
                      <span className="block text-[11px] text-slate-500">{item.brand}</span>
                    )}
                  </div>
                  <span className="shrink-0 font-medium">{item.salePrice.toLocaleString("uk-UA")} ₴</span>
                </Link>
              ))}
            </>
          )}
          {items.length === 0 && hints && (
            <div className="text-sm text-slate-600">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Спробуйте категорії або бренди
              </div>
              <div className="space-y-2">
                {hints.categories.length > 0 && (
                  <div>
                    <span className="text-[11px] text-slate-400">Категорії:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {hints.categories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/c/${c.slug}`}
                          className="rounded-full border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                          onClick={() => setOpen(false)}
                        >
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
                        <Link
                          key={b}
                          href={`/catalog?brand=${encodeURIComponent(b)}`}
                          className="rounded-full border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50"
                          onClick={() => setOpen(false)}
                        >
                          {b}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <Link
            href={`/catalog?q=${encodeURIComponent(query)}`}
            className="mt-2 block rounded-lg border-t border-slate-100 px-3 py-2 text-center text-xs text-lilac hover:bg-[var(--lilac-50)]"
            onClick={() => setOpen(false)}
          >
            Всі результати →
          </Link>
        </div>
      )}
    </div>
  );
}
