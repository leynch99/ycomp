"use client";

import { useState } from "react";

type Option = { id: string; name: string };
type ProductRow = { id: string; name: string; brand: string; salePrice: number };

export function AdminProductsClient({
  categories,
  suppliers,
  products,
}: {
  categories: Option[];
  suppliers: Option[];
  products: ProductRow[];
}) {
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setMessage(res.ok ? "Збережено" : "Помилка");
    if (res.ok) window.location.reload();
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="grid gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 text-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Назва" required className="rounded-lg border border-slate-200 px-3 py-2" />
          <input name="slug" placeholder="Slug" required className="rounded-lg border border-slate-200 px-3 py-2" />
          <input name="sku" placeholder="SKU" required className="rounded-lg border border-slate-200 px-3 py-2" />
          <input name="brand" placeholder="Бренд" required className="rounded-lg border border-slate-200 px-3 py-2" />
          <input name="costPrice" placeholder="Закуп" required className="rounded-lg border border-slate-200 px-3 py-2" />
          <input name="salePrice" placeholder="Ціна" required className="rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select name="categoryId" required className="rounded-lg border border-slate-200 px-3 py-2">
            <option value="">Категорія</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select name="supplierId" required className="rounded-lg border border-slate-200 px-3 py-2">
            <option value="">Постачальник</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <button className="w-fit rounded-full bg-lilac px-4 py-2 text-xs text-white">
          Додати товар
        </button>
        {message && <div className="text-xs text-slate-500">{message}</div>}
      </form>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm">
        <div className="font-semibold text-slate-900">Останні товари</div>
        <div className="mt-3 space-y-2 text-slate-600">
          {products.map((product) => (
            <div key={product.id} className="flex justify-between">
              <span>{product.name}</span>
              <span>{product.brand}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
