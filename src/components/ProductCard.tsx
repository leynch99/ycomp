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
          className="object-contain p-4 transition duration-300 group-hover:scale-105"
        />
      </div>
      <Link
        href={`/p/${product.slug}`}
        className={`mt-4 font-semibold text-slate-900 ${compact ? "text-xs" : "text-sm"}`}
      >
        {product.name}
      </Link>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{product.brand}</div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className={`font-semibold text-slate-900 ${compact ? "text-base" : "text-lg"}`}>
          {formatPrice(product.salePrice)}
        </div>
        {product.oldPrice && (
          <div className="text-xs text-slate-400 line-through">
            {formatPrice(product.oldPrice)}
          </div>
        )}
      </div>
      <div className="mt-1 text-xs text-slate-500">Наявність: {leadLabel}</div>
      {stockLabel && <div className="mt-1 text-xs font-medium text-emerald-700">{stockLabel}</div>}
      <div className={`mt-auto flex gap-2 ${compact ? "pt-3 text-[11px]" : "pt-4 text-xs"}`}>
        <button
          onClick={() => addItem(product, 1)}
          className="flex-1 rounded-full bg-lilac px-3 py-2 text-white transition hover:opacity-90"
        >
          В кошик
        </button>
        <button
          onClick={() => toggle(product)}
          className={`rounded-full border px-3 py-2 transition hover:border-lilac hover:text-lilac ${
            isInWishlist(product.id) ? "border-lilac text-lilac" : "text-slate-400"
          }`}
        >
          ♥
        </button>
        <button
          onClick={() => toggleCompare(product)}
          className={`rounded-full border px-3 py-2 transition hover:border-lilac hover:text-lilac ${
            isInCompare(product.id) ? "border-lilac text-lilac" : "text-slate-400"
          }`}
        >
          ⇄
        </button>
      </div>
    </div>
  );
}
