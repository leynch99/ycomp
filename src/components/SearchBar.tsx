"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SearchItem = {
  id: string;
  name: string;
  slug: string;
  salePrice: number;
  image?: string | null;
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { items: SearchItem[] };
      setResults(data.items);
      setOpen(true);
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="relative w-full max-w-lg">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Пошук товарів"
        className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none focus:border-slate-400"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border bg-white p-2 shadow-xl">
          {results.map((item) => (
            <Link
              key={item.id}
              href={`/p/${item.slug}`}
              className="flex items-center justify-between gap-4 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => setOpen(false)}
            >
              <span className="line-clamp-1">{item.name}</span>
              <span className="font-medium">{item.salePrice} ₴</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
