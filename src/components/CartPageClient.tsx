"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { ProductListItem } from "@/lib/types";

export function CartPageClient() {
  const { items, updateQty, removeItem, total, addItem } = useCart();
  const searchParams = useSearchParams();
  const [promo, setPromo] = useState("");

  useEffect(() => {
    const addId = searchParams.get("add");
    if (!addId) return;
    fetch(`/api/products/${addId}`)
      .then((res) => res.json())
      .then((data: { product?: ProductListItem }) => {
        if (data.product) addItem(data.product, 1);
      })
      .catch(() => null);
  }, [searchParams, addItem]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        {items.length === 0 && (
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm">
            Кошик порожній. <Link href="/catalog">Перейти до каталогу</Link>
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4"
          >
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">{item.name}</div>
              <div className="text-xs text-slate-500">{item.sku}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="h-8 w-8 rounded-full border border-lilac text-slate-600"
                onClick={() => updateQty(item.id, item.qty - 1)}
              >
                -
              </button>
              <span className="w-8 text-center text-sm">{item.qty}</span>
              <button
                className="h-8 w-8 rounded-full border border-lilac text-slate-600"
                onClick={() => updateQty(item.id, item.qty + 1)}
              >
                +
              </button>
            </div>
            <div className="w-28 text-right text-sm font-semibold">
              {formatPrice(item.salePrice * item.qty)}
            </div>
            <button className="text-xs text-slate-500" onClick={() => removeItem(item.id)}>
              Видалити
            </button>
          </div>
        ))}
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4">
          <div className="text-sm font-semibold text-slate-900">Апселл</div>
          <div className="mt-2 text-sm text-slate-500">
            Додайте термопасту, кабелі або вентилятори для кращого результату.
          </div>
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-lilac bg-white p-6 shadow-sm lg:sticky lg:top-32">
        <div className="text-sm font-semibold text-slate-900">Промокод</div>
        <input
          value={promo}
          onChange={(event) => setPromo(event.target.value)}
          placeholder="PROMO2026"
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <div className="mt-4 rounded-xl bg-[var(--lilac-50)] px-3 py-2 text-xs text-slate-600">
          Доставка Новою Поштою: 1–3 дні
        </div>
        <div className="mt-6 flex items-center justify-between text-sm">
          <span>Разом</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center rounded-full bg-lilac px-4 py-2 text-sm text-white"
        >
          Оформити замовлення
        </Link>
      </aside>
    </div>
  );
}
