"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";

export function CartModal() {
  const { isModalOpen, lastAddedId, total, closeModal, updateQty, removeItem, items } = useCart();
  const current = items.find((item) => item.id === lastAddedId) ?? items[0];

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, closeModal]);

  if (!isModalOpen || !current) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 px-0 transition-opacity duration-200 sm:items-center sm:px-4"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-lg animate-[cartIn_200ms_ease-out] rounded-t-2xl border border-lilac bg-white p-4 shadow-xl sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900">Кошик</div>
          <button
            onClick={closeModal}
            className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <Image
              src={current.image ?? "/images/placeholder.svg"}
              alt={current.name}
              fill
              className="object-contain p-2"
              unoptimized={!!(current.image?.startsWith("http"))}
            />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">{current.name}</div>
            <div className="mt-1 text-xs text-slate-500">{current.sku}</div>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => updateQty(current.id, current.qty - 1)}
                className="h-7 w-7 rounded-full border border-lilac text-slate-600"
              >
                -
              </button>
              <span className="w-6 text-center text-xs">{current.qty}</span>
              <button
                onClick={() => updateQty(current.id, current.qty + 1)}
                className="h-7 w-7 rounded-full border border-lilac text-slate-600"
              >
                +
              </button>
              <button
                onClick={() => removeItem(current.id)}
                className="ml-2 text-xs text-slate-500"
              >
                Видалити
              </button>
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-900">
            {formatPrice(current.salePrice * current.qty)}
          </div>
        </div>
        {items.length > 1 && (
          <div className="mt-4 max-h-28 space-y-2 overflow-auto rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            {items.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="truncate">
                  {item.name} × {item.qty}
                </span>
                <span className="flex items-center gap-2">
                  {formatPrice(item.salePrice * item.qty)}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500"
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
            {items.length > 5 && <div>… та ще {items.length - 5}</div>}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-600">Разом</span>
          <span className="font-semibold text-slate-900">{formatPrice(total)}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:gap-3">
          <button
            onClick={closeModal}
            className="flex-1 rounded-full border border-lilac px-4 py-2.5 text-xs text-slate-700"
          >
            Продовжити покупки
          </button>
          <Link
            href="/checkout"
            onClick={closeModal}
            className="flex-1 rounded-full bg-lilac px-4 py-2.5 text-center text-xs text-white"
          >
            Зробити замовлення
          </Link>
        </div>
      </div>
    </div>
  );
}
