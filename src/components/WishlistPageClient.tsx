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
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm">
        Список порожній. <Link href="/catalog">Перейти до каталогу</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-2xl border border-slate-200/70 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="text-sm font-semibold text-slate-900">{item.name}</div>
          <div className="text-xs text-slate-500">{item.brand}</div>
          <div className="mt-2 text-sm">{formatPrice(item.salePrice)}</div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => addItem(item, 1)}
              className="rounded-full bg-lilac px-4 py-2 text-xs text-white"
            >
              В кошик
            </button>
            <button
              onClick={() => toggle(item)}
              className="rounded-full border border-lilac px-4 py-2 text-xs text-slate-600"
            >
              Видалити
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
