"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";

type ProductImage = { url: string };
type Spec = { label: string; value: string };
type ProductForPage = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  description: string;
  salePrice: number;
  oldPrice: number | null;
  inStock: boolean;
  stockQty: number | null;
  leadTimeMinDays: number | null;
  leadTimeMaxDays: number | null;
  isDeal: boolean;
  isOutlet: boolean;
  images: ProductImage[];
  specs: Spec[];
};

type Tab = "description" | "specs" | "reviews";

export function ProductPageClient({ product }: { product: ProductForPage }) {
  const { addItem } = useCart();
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<Tab>("description");
  const [qty, setQty] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const images = product.images.length > 0 ? product.images : [{ url: "/images/placeholder.svg" }];
  const isExternal = (url: string) => url.startsWith("http");

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        brand: product.brand,
        salePrice: product.salePrice,
        oldPrice: product.oldPrice,
        inStock: product.inStock,
        stockQty: product.stockQty,
        leadTimeMinDays: product.leadTimeMinDays,
        leadTimeMaxDays: product.leadTimeMaxDays,
        image: images[0]?.url,
        isDeal: product.isDeal,
        isOutlet: product.isOutlet,
      },
      qty
    );
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "description", label: "Опис" },
    { key: "specs", label: "Характеристики" },
    { key: "reviews", label: "Відгуки" },
  ];

  return (
    <>
      <div className="grid gap-5 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Image gallery */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-lilac bg-gradient-to-br from-[var(--lilac-50)] via-white to-[var(--lilac-100)] shadow-sm sm:rounded-3xl">
            <Image
              src={images[activeImage]?.url ?? "/images/placeholder.svg"}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6 sm:p-10"
              unoptimized={isExternal(images[activeImage]?.url ?? "")}
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-3">
              {images.map((img, i) => (
                <button
                  key={`${img.url}-${i}`}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square overflow-hidden rounded-xl border bg-white sm:rounded-2xl ${
                    i === activeImage ? "border-lilac ring-2 ring-lilac/30" : "border-slate-200/70 hover:border-[var(--lilac-500)]"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={product.name}
                    fill
                    loading="lazy"
                    sizes="80px"
                    className="object-contain p-2 sm:p-3"
                    unoptimized={isExternal(img.url)}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs">{product.brand}</div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:mt-2 sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-1 text-[11px] text-slate-500 sm:mt-2 sm:text-xs">SKU: {product.sku}</div>
          </div>

          {/* Price block */}
          <div className="rounded-xl border border-lilac bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {formatPrice(product.salePrice)}
              </div>
              {product.oldPrice && (
                <div className="text-xs text-slate-400 line-through sm:text-sm">
                  {formatPrice(product.oldPrice)}
                </div>
              )}
              {product.oldPrice && (
                <div className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-medium text-white">
                  -{Math.round(((product.oldPrice - product.salePrice) / product.oldPrice) * 100)}%
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {product.inStock
                ? product.stockQty
                  ? `В наявності (${product.stockQty} шт.)`
                  : "В наявності"
                : `Під замовлення ${product.leadTimeMinDays ?? 3}–${product.leadTimeMaxDays ?? 7} днів`}
            </div>

            {/* Quantity + buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-slate-200">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center text-sm text-slate-600"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="flex h-9 w-9 items-center justify-center text-sm text-slate-600"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="rounded-full bg-lilac px-6 py-2.5 text-sm text-white transition hover:opacity-90"
              >
                В кошик
              </button>
              <button
                onClick={() => setShowBuyModal(true)}
                className="rounded-full border border-lilac px-5 py-2 text-sm text-slate-700 transition hover:text-[var(--lilac-900)]"
              >
                Купити в 1 клік
              </button>
            </div>

            <div className="mt-4 grid gap-2 rounded-xl bg-[var(--lilac-50)] px-3 py-2 text-xs text-slate-600">
              <div>Гарантія та повернення 14 днів</div>
              <div>Доставка: Нова Пошта / Укрпошта, 1–3 дні</div>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Сумісність", text: "Перевіримо під вашу збірку" },
              { title: "Підтримка", text: "Консультація перед покупкою" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                <div className="mt-2 text-xs text-slate-600">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 sm:mt-12">
        <div className="flex gap-1 border-b border-slate-200">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === t.key
                  ? "border-lilac text-[var(--lilac-900)]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "description" && (
            <div className="prose prose-sm max-w-none text-slate-600">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p className="text-slate-400">Опис буде додано пізніше.</p>
              )}
            </div>
          )}

          {tab === "specs" && (
            <div className="rounded-2xl border border-slate-200/70 bg-white">
              {product.specs.length > 0 ? (
                <table className="w-full text-sm">
                  <tbody>
                    {product.specs.map((spec, i) => (
                      <tr key={spec.label} className={i % 2 === 0 ? "bg-slate-50/50" : ""}>
                        <td className="px-4 py-3 font-medium text-slate-700">{spec.label}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-sm text-slate-400">Характеристики не вказані.</div>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm text-slate-600">
                Скоро тут зʼявляться відгуки покупців.
              </div>
              <div className="rounded-2xl border border-lilac bg-white p-6 text-sm">
                <div className="text-sm font-semibold text-slate-900">Залишити відгук</div>
                <div className="mt-2 text-xs text-slate-500">
                  Авторизація потрібна у фінальній версії.
                </div>
                <button className="mt-4 rounded-full bg-lilac px-4 py-2 text-xs text-white">
                  Написати відгук
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buy in 1 click modal */}
      {showBuyModal && (
        <BuyOneClickModal
          product={product}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </>
  );
}

function BuyOneClickModal({
  product,
  onClose,
}: {
  product: { id: string; name: string; salePrice: number; sku: string };
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          productId: product.id,
        }),
      });
      if (res.ok) {
        setDone(true);
        toast.success("Замовлення створено! Менеджер звʼяжеться з вами.");
      } else {
        toast.error("Помилка. Спробуйте ще раз.");
      }
    } catch {
      toast.error("Помилка зʼєднання.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-lilac bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Купити в 1 клік</h3>
          <button onClick={onClose} className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600">
            ✕
          </button>
        </div>
        <div className="mt-3 text-sm text-slate-600">
          {product.name} — {formatPrice(product.salePrice)}
        </div>

        {done ? (
          <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Замовлення створено! Менеджер звʼяжеться з вами найближчим часом.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ваше імʼя"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+380XXXXXXXXX"
              pattern="\+380\d{9}"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-lilac px-4 py-2.5 text-sm text-white disabled:opacity-50"
            >
              {loading ? "Оформлюємо..." : "Оформити замовлення"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
