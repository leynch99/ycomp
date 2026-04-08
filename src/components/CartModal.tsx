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
      role="dialog"
      aria-modal="true"
      aria-label="Кошик"
      className="fixed inset-0 z-[60] flex items-end justify-center animate-fade-in bg-black/40 backdrop-blur-sm px-0 sm:items-center sm:px-4"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-lg animate-[cartIn_200ms_ease-out] rounded-t-2xl border border-lilac-300 dark:border-lilac-800 bg-white dark:bg-slate-900 p-4 shadow-2xl sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-900 dark:text-white">Кошик</div>
          <button
            onClick={closeModal}
            aria-label="Закрити кошик"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="mt-4 flex gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800">
            <Image
              src={current.image ?? "/images/placeholder.svg"}
              alt={current.name}
              fill
              className="object-contain p-2"
              unoptimized={!!(current.image?.startsWith("http"))}
            />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">{current.name}</div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{current.sku}</div>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => updateQty(current.id, current.qty - 1)}
                aria-label="Зменшити кількість"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-lilac-300 dark:border-lilac-700 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-lilac-50 dark:hover:bg-lilac-900/30 hover:border-lilac-500 active:scale-90"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-medium dark:text-slate-200">{current.qty}</span>
              <button
                onClick={() => updateQty(current.id, current.qty + 1)}
                aria-label="Збільшити кількість"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-lilac-300 dark:border-lilac-700 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:bg-lilac-50 dark:hover:bg-lilac-900/30 hover:border-lilac-500 active:scale-90"
              >
                +
              </button>
              <button
                onClick={() => removeItem(current.id)}
                aria-label={`Видалити ${current.name} з кошика`}
                className="ml-2 text-xs text-slate-500 dark:text-slate-400 transition-all duration-200 hover:text-red-500 dark:hover:text-red-400 active:scale-95"
              >
                Видалити
              </button>
            </div>
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">
            {formatPrice(current.salePrice * current.qty)}
          </div>
        </div>
        {items.length > 1 && (
          <div className="mt-4 max-h-28 space-y-2 overflow-auto rounded-2xl border border-slate-200/70 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
            {items.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="truncate">
                  {item.name} × {item.qty}
                </span>
                <span className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-medium dark:text-white">{formatPrice(item.salePrice * item.qty)}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Видалити ${item.name}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 text-[10px] text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-500/20 dark:hover:text-red-400 dark:hover:border-red-500/30 transition"
                  >
                    ✕
                  </button>
                </span>
              </div>
            ))}
            {items.length > 5 && <div className="text-center font-medium">… та ще {items.length - 5}</div>}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Разом</span>
          <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(total)}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:gap-3">
          <button
            onClick={closeModal}
            className="flex-1 rounded-full border border-lilac-300 dark:border-lilac-700 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all duration-200 hover:bg-lilac-50 dark:hover:bg-lilac-900/20 hover:border-lilac-500 active:scale-95 text-center"
          >
            Продовжити покупки
          </button>
          <Link
            href="/checkout"
            onClick={closeModal}
            className="flex-1 rounded-full bg-gradient-to-r from-lilac-600 to-lilac-500 px-4 py-2.5 text-center text-xs font-medium text-white shadow-lg shadow-lilac-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-lilac-500/40 active:scale-95"
          >
            Зробити замовлення
          </Link>
        </div>
      </div>
    </div>
  );
}
