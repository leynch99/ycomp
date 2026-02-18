"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { ProductListItem } from "@/lib/types";

export function CartPageClient() {
  const { items, updateQty, removeItem, total, addItem } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [promo, setPromo] = useState("");
  const processedAddId = useRef<string | null>(null);

  useEffect(() => {
    const addId = searchParams.get("add");
    if (!addId || processedAddId.current === addId) return;
    processedAddId.current = addId;
    fetch(`/api/products/${addId}`)
      .then((res) => res.json())
      .then((data: { product?: ProductListItem }) => {
        if (data.product) addItem(data.product, 1);
      })
      .catch(() => null)
      .finally(() => {
        router.replace("/cart", { scroll: false });
      });
  }, [searchParams, addItem, router]);

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-3 sm:space-y-4">
        {items.length === 0 && (
          <div className="rounded-xl border border-slate-200/70 bg-white p-4 text-sm sm:rounded-2xl sm:p-6">
            Кошик порожній.{" "}
            <Link href="/catalog" className="text-lilac underline">
              Перейти до каталогу
            </Link>
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200/70 bg-white p-3 sm:rounded-2xl sm:p-4"
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 sm:text-sm">{item.name}</div>
                <div className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">{item.sku}</div>
              </div>
              <div className="shrink-0 text-right text-xs font-semibold text-slate-900 sm:text-sm">
                {formatPrice(item.salePrice * item.qty)}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-lilac text-xs text-slate-600 sm:h-8 sm:w-8"
                  onClick={() => updateQty(item.id, item.qty - 1)}
                >
                  -
                </button>
                <span className="w-6 text-center text-xs sm:w-8 sm:text-sm">{item.qty}</span>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-lilac text-xs text-slate-600 sm:h-8 sm:w-8"
                  onClick={() => updateQty(item.id, item.qty + 1)}
                >
                  +
                </button>
              </div>
              <button className="text-[11px] text-slate-500 sm:text-xs" onClick={() => removeItem(item.id)}>
                Видалити
              </button>
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-slate-200/70 bg-white p-3 sm:rounded-2xl sm:p-4">
          <div className="text-xs font-semibold text-slate-900 sm:text-sm">Апселл</div>
          <div className="mt-1 text-xs text-slate-500 sm:mt-2 sm:text-sm">
            Додайте термопасту, кабелі або вентилятори для кращого результату.
          </div>
        </div>
      </div>
      <aside className="h-fit rounded-xl border border-lilac bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:sticky lg:top-32">
        <div className="text-xs font-semibold text-slate-900 sm:text-sm">Промокод</div>
        <input
          value={promo}
          onChange={(event) => setPromo(event.target.value)}
          placeholder="PROMO2026"
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs sm:mt-3 sm:text-sm"
        />
        <div className="mt-3 rounded-xl bg-[var(--lilac-50)] px-3 py-2 text-[11px] text-slate-600 sm:mt-4 sm:text-xs">
          Доставка Новою Поштою: 1–3 дні
        </div>
        <div className="mt-4 flex items-center justify-between text-xs sm:mt-6 sm:text-sm">
          <span>Разом</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-4 flex w-full items-center justify-center rounded-full bg-lilac px-4 py-2.5 text-xs text-white sm:mt-6 sm:text-sm"
        >
          Оформити замовлення
        </Link>
      </aside>
    </div>
  );
}
