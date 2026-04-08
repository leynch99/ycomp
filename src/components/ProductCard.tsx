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
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  useEffect(() => {
    setImgSrc(product.image ?? PLACEHOLDER);
  }, [product.image]);

  const handleAddToCart = async () => {
    setIsAdding(true);
    addItem(product, 1);
    setTimeout(() => setIsAdding(false), 600);
  };

  const leadLabel = product.inStock
    ? "В наявності"
    : `Під замовлення ${product.leadTimeMinDays ?? 3}-${product.leadTimeMaxDays ?? 7} днів`;
  const stockLabel =
    product.inStock && product.stockQty ? `Залишилось ${product.stockQty} шт.` : null;
  const leadClass = product.inStock ? "bg-emerald-600" : "bg-slate-600";

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.salePrice) / product.oldPrice) * 100)
    : 0;

  return (
    <div
      className={`group relative flex h-full flex-col rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-lilac-500/20 dark:hover:shadow-lilac-500/30 hover:border-lilac-300/50 dark:hover:border-lilac-500/50 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
        {/* Badges */}
        <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1.5 text-[10px]">
          <span className={`rounded-full px-2.5 py-1 text-white shadow-md backdrop-blur-sm ${leadClass} transition-transform hover:scale-105`}>
            {leadLabel}
          </span>
          {product.isDeal && (
            <span className="animate-pulse-glow rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-2.5 py-1 text-white shadow-md backdrop-blur-sm">
              🔥 Акція
            </span>
          )}
          {product.isOutlet && (
            <span className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-2.5 py-1 text-white shadow-md backdrop-blur-sm">
              Уцінка
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 font-semibold text-white shadow-md backdrop-blur-sm">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={() => toggle(product)}
            aria-label={isInWishlist(product.id) ? "Видалити з обраного" : "Додати в обране"}
            className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 ${
              isInWishlist(product.id)
                ? "bg-red-500 text-white shadow-lg shadow-red-500/50"
                : "bg-white/90 text-slate-600 hover:bg-red-50 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-red-900/50"
            }`}
          >
            <svg className="h-5 w-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button
            onClick={() => toggleCompare(product)}
            aria-label={isInCompare(product.id) ? "Видалити з порівняння" : "Додати до порівняння"}
            className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 ${
              isInCompare(product.id)
                ? "bg-lilac-500 text-white shadow-lg shadow-lilac-500/50"
                : "bg-white/90 text-slate-600 hover:bg-lilac-50 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:bg-lilac-900/50"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>

        {/* Product Image */}
        <Link href={`/p/${product.slug}`} className="block h-full">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-2"
            unoptimized={!!(imgSrc.startsWith("http"))}
            onError={() => setImgSrc(PLACEHOLDER)}
          />
        </Link>

        {/* Quick View Button */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Link
            href={`/p/${product.slug}`}
            className="glass rounded-full px-4 py-2 text-xs font-medium text-slate-900 dark:text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Швидкий перегляд
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="mt-3 flex flex-1 flex-col sm:mt-4">
        <Link
          href={`/p/${product.slug}`}
          title={product.name}
          className={`line-clamp-2 font-semibold tracking-tight text-slate-900 dark:text-slate-100 transition-colors hover:text-lilac-600 dark:hover:text-lilac-400 ${
            compact ? "text-[11px] sm:text-xs" : "text-xs sm:text-sm"
          }`}
        >
          {product.name}
        </Link>

        <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:text-xs">
          {product.brand}
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2 sm:mt-3">
          <div className={`font-bold text-slate-900 dark:text-white ${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}>
            {formatPrice(product.salePrice)}
          </div>
          {product.oldPrice && (
            <div className="text-xs text-slate-400 dark:text-slate-500 line-through sm:text-sm">
              {formatPrice(product.oldPrice)}
            </div>
          )}
        </div>

        {/* Stock Info */}
        <div className="mt-1 hidden text-xs text-slate-600 dark:text-slate-400 sm:block">
          {leadLabel}
        </div>
        {stockLabel && (
          <div className="mt-0.5 hidden text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:block">
            {stockLabel}
          </div>
        )}

        {/* Actions */}
        <div className={`mt-auto flex gap-2 ${compact ? "pt-2 sm:pt-3" : "pt-3 sm:pt-4"}`}>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={`Додати ${product.name} в кошик`}
            className={`flex-1 rounded-full bg-gradient-to-r from-lilac-600 to-lilac-500 px-3 py-2.5 text-xs font-medium text-white shadow-lg shadow-lilac-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-lilac-500/40 active:scale-95 disabled:opacity-50 sm:px-4 sm:py-3 sm:text-sm ${
              isAdding ? "animate-pulse" : "hover:-translate-y-0.5"
            }`}
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Додаємо...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                В кошик
              </span>
            )}
          </button>

          {/* Mobile Wishlist Button */}
          <button
            onClick={() => toggle(product)}
            aria-label={isInWishlist(product.id) ? "Видалити з обраного" : "Додати в обране"}
            className={`flex sm:hidden items-center justify-center rounded-full border-2 px-3 py-2.5 transition-all duration-200 hover:scale-105 active:scale-95 ${
              isInWishlist(product.id)
                ? "border-red-500 bg-red-50 text-red-500 dark:bg-red-900/20"
                : "border-slate-300 text-slate-600 hover:border-red-500 hover:text-red-500 dark:border-slate-600 dark:text-slate-400"
            }`}
          >
            <svg className="h-5 w-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
