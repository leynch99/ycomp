"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ProductListItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useCompare } from "@/components/providers/CompareProvider";

const PLACEHOLDER = "/images/placeholder.svg";

export function ProductCard({
  product,
  compact,
}: {
  product: ProductListItem;
  compact?: boolean;
}) {
  const { addItem } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const { toggle: toggleCompare, isInCompare } = useCompare();
  const [imgSrc, setImgSrc] = useState(product.image ?? PLACEHOLDER);
  
  useEffect(() => {
    setImgSrc(product.image ?? PLACEHOLDER);
  }, [product.image]);

  const leadLabel = product.inStock
    ? "В наявності"
    : `Під замовлення ${product.leadTimeMinDays ?? 3}-${product.leadTimeMaxDays ?? 7} днів`;
  const stockLabel =
    product.inStock && product.stockQty ? `Залишилось ${product.stockQty} шт.` : null;
  const leadClass = product.inStock ? "bg-emerald-600" : "bg-slate-600";

  return (
    <div
      className={`group flex h-full flex-col rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-lilac-500/10 dark:hover:shadow-lilac-500/20 hover:border-lilac-300/50 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-2 text-[10px]">
          <span className={`rounded-full px-2 py-0.5 text-white shadow ${leadClass}`}>
            {leadLabel}
          </span>
          {product.isDeal && (
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-white shadow">Акція</span>
          )}
          {product.isOutlet && (
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-white shadow">Уцінка</span>
          )}
        </div>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 transition duration-300 group-hover:scale-105"
          unoptimized={!!(imgSrc.startsWith("http"))}
          onError={() => setImgSrc(PLACEHOLDER)}
        />
      </div>
      <Link
        href={`/p/${product.slug}`}
        className={`mt-2 line-clamp-2 font-semibold tracking-tight text-slate-900 dark:text-slate-100 transition-colors group-hover:text-lilac-600 dark:group-hover:text-lilac-400 sm:mt-4 ${compact ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"}`}
      >
        {product.name}
      </Link>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:mt-1 sm:text-xs">{product.brand}</div>
      <div className="mt-2 flex items-baseline gap-1 sm:mt-3 sm:gap-2">
        <div className={`font-semibold text-slate-900 dark:text-white ${compact ? "text-sm sm:text-base" : "text-sm sm:text-lg"}`}>
          {formatPrice(product.salePrice)}
        </div>
        {product.oldPrice && (
          <div className="text-[10px] text-slate-400 dark:text-slate-500 line-through sm:text-xs">
            {formatPrice(product.oldPrice)}
          </div>
        )}
      </div>
      <div className="mt-0.5 hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Наявність: {leadLabel}</div>
      {stockLabel && <div className="mt-0.5 hidden text-xs font-medium text-emerald-600 dark:text-emerald-500 sm:block">{stockLabel}</div>}
      <div className={`mt-auto flex gap-1 sm:gap-2 ${compact ? "pt-2 text-[10px] sm:pt-3 sm:text-[11px]" : "pt-2 text-[10px] sm:pt-4 sm:text-xs"}`}>
        <button
          onClick={() => addItem(product, 1)}
          className="flex-1 rounded-full bg-lilac px-2 py-1.5 text-white shadow-md shadow-lilac-500/20 transition-transform active:scale-95 hover:opacity-90 sm:px-3 sm:py-2"
        >
          В кошик
        </button>
        <button
          onClick={() => toggle(product)}
          className={`rounded-full border px-2 py-1.5 transition hover:border-lilac hover:text-lilac sm:px-3 sm:py-2 ${
            isInWishlist(product.id) ? "border-lilac text-lilac" : "text-slate-400"
          }`}
        >
          ♥
        </button>
        <button
          onClick={() => toggleCompare(product)}
          className={`hidden rounded-full border px-2 py-1.5 transition hover:border-lilac hover:text-lilac sm:block sm:px-3 sm:py-2 ${
            isInCompare(product.id) ? "border-lilac text-lilac" : "text-slate-400"
          }`}
        >
          ⇄
        </button>
      </div>
    </div>
  );
}
