"use client";

import Link from "next/link";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";

export function WishlistPageClient() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 text-sm dark:text-slate-200">
        Список порожній. <Link href="/catalog" className="text-lilac hover:underline">Перейти до каталогу</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900/60 p-4 transition hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-white/5"
        >
          <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{item.name}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.brand}</div>
          <div className="mt-2 text-sm font-semibold dark:text-slate-200">{formatPrice(item.salePrice)}</div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => addItem(item, 1)}
              className="rounded-full bg-lilac px-4 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-lilac-600 dark:hover:bg-lilac-400"
            >
              В кошик
            </button>
            <button
              onClick={() => toggle(item)}
              className="rounded-full border border-slate-200 dark:border-white/10 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:border-red-200 hover:text-red-500 hover:bg-red-50 dark:hover:border-red-500/30 dark:hover:text-red-400 dark:hover:bg-red-500/20"
            >
              Видалити
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
