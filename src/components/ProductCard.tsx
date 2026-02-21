"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductListItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useCompare } from "@/components/providers/CompareProvider";

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
  const leadLabel = product.inStock
    ? "В наявності"
    : `Під замовлення ${product.leadTimeMinDays ?? 3}-${product.leadTimeMaxDays ?? 7} днів`;
  const stockLabel =
    product.inStock && product.stockQty ? `Залишилось ${product.stockQty} шт.` : null;
  const leadClass = product.inStock ? "bg-emerald-600" : "bg-slate-600";

  return (
    <div
      className={`group flex h-full flex-col rounded-2xl border border-slate-200/70 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
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
          src={product.image ?? "/images/placeholder.svg"}
          alt={product.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 transition duration-300 group-hover:scale-105"
          unoptimized={!!(product.image?.startsWith("http"))}
        />
      </div>
      <Link
        href={`/p/${product.slug}`}
        className={`mt-2 line-clamp-2 font-semibold text-slate-900 sm:mt-4 ${compact ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"}`}
      >
        {product.name}
      </Link>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400 sm:mt-1 sm:text-xs">{product.brand}</div>
      <div className="mt-2 flex items-baseline gap-1 sm:mt-3 sm:gap-2">
        <div className={`font-semibold text-slate-900 ${compact ? "text-sm sm:text-base" : "text-sm sm:text-lg"}`}>
          {formatPrice(product.salePrice)}
        </div>
        {product.oldPrice && (
          <div className="text-[10px] text-slate-400 line-through sm:text-xs">
            {formatPrice(product.oldPrice)}
          </div>
        )}
      </div>
      <div className="mt-0.5 hidden text-xs text-slate-500 sm:block">Наявність: {leadLabel}</div>
      {stockLabel && <div className="mt-0.5 hidden text-xs font-medium text-emerald-700 sm:block">{stockLabel}</div>}
      <div className={`mt-auto flex gap-1 sm:gap-2 ${compact ? "pt-2 text-[10px] sm:pt-3 sm:text-[11px]" : "pt-2 text-[10px] sm:pt-4 sm:text-xs"}`}>
        <button
          onClick={() => addItem(product, 1)}
          className="flex-1 rounded-full bg-lilac px-2 py-1.5 text-white transition hover:opacity-90 sm:px-3 sm:py-2"
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
