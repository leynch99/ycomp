"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function CatalogSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "popular";

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={(event) => onChange(event.target.value)}
      className="rounded-full border border-lilac px-3 py-2 text-xs text-slate-700"
    >
      <option value="popular">Популярні</option>
      <option value="price_asc">Ціна ↑</option>
      <option value="price_desc">Ціна ↓</option>
      <option value="new">Новинки</option>
    </select>
  );
}
