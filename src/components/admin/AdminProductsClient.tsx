"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { AdminProductForm } from "./AdminProductForm";

type Option = { id: string; name: string };
type ProductRow = { id: string; name: string; brand: string; salePrice: number; isDeal: boolean; isOutlet: boolean; inStock: boolean };

export function AdminProductsClient({
  categories,
  suppliers,
  products,
}: {
  categories: Option[];
  suppliers: Option[];
  products: ProductRow[];
}) {
  const [showForm, setShowForm] = useState(false);

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`Видалити "${name}"?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-lilac px-5 py-2 text-xs text-white"
        >
          {showForm ? "Сховати форму" : "+ Додати товар"}
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-lilac/30 bg-[var(--lilac-50)]/30 p-4">
          <AdminProductForm
            categories={categories}
            suppliers={suppliers}
            onSuccess={() => {
              setTimeout(() => window.location.reload(), 800);
            }}
          />
        </div>
      )}

      <div className="rounded-xl border border-slate-200/70 bg-white text-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Товари ({products.length})
        </div>
        <div className="divide-y divide-slate-100">
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-900">{product.name}</div>
                <div className="mt-0.5 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="text-slate-500">{product.brand}</span>
                  {product.isDeal && <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-white">Акція</span>}
                  {product.isOutlet && <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-white">Уцінка</span>}
                  {!product.inStock && <span className="rounded-full bg-slate-400 px-1.5 py-0.5 text-white">Немає</span>}
                </div>
              </div>
              <div className="shrink-0 text-right text-sm font-semibold text-slate-900">
                {formatPrice(product.salePrice)}
              </div>
              <div className="flex shrink-0 gap-1">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="rounded-full border border-lilac px-3 py-1 text-[11px] text-slate-700 hover:bg-[var(--lilac-50)]"
                >
                  Редагувати
                </Link>
                <button
                  onClick={() => deleteProduct(product.id, product.name)}
                  className="rounded-full border border-red-200 px-3 py-1 text-[11px] text-red-600 hover:bg-red-50"
                >
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
