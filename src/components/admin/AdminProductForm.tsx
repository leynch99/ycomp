"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";

type Option = { id: string; name: string };

type ProductData = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  description: string;
  categoryId: string;
  supplierId: string;
  costPrice: number;
  salePrice: number;
  oldPrice: number | null;
  inStock: boolean;
  stockQty: number | null;
  isDeal: boolean;
  isOutlet: boolean;
  popularity: number;
  leadTimeMinDays: number;
  leadTimeMaxDays: number;
  images: string[];
};

const empty: ProductData = {
  name: "",
  slug: "",
  sku: "",
  brand: "",
  description: "",
  categoryId: "",
  supplierId: "",
  costPrice: 0,
  salePrice: 0,
  oldPrice: null,
  inStock: true,
  stockQty: null,
  isDeal: false,
  isOutlet: false,
  popularity: 50,
  leadTimeMinDays: 1,
  leadTimeMaxDays: 7,
  images: [],
};

export function AdminProductForm({
  categories,
  suppliers,
  initial,
  onSuccess,
}: {
  categories: Option[];
  suppliers: Option[];
  initial?: Partial<ProductData> & { id?: string };
  onSuccess?: () => void;
}) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState<ProductData>({ ...empty, ...initial });
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const set = <K extends keyof ProductData>(key: K, value: ProductData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const autoSlug = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-zа-яіїєґ0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);
    return slug + "-" + Date.now().toString().slice(-4);
  };

  const addImage = () => {
    const url = imageInput.trim();
    if (!url) return;
    set("images", [...form.images, url]);
    setImageInput("");
  };

  const removeImage = (index: number) => {
    set("images", form.images.filter((_, i) => i !== index));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      ...form,
      slug: form.slug || autoSlug(form.name),
    };

    const url = isEdit ? `/api/admin/products/${initial!.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage(isEdit ? "Товар оновлено" : "Товар додано");
        if (!isEdit) setForm({ ...empty });
        onSuccess?.();
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(`Помилка: ${data.error || res.status}`);
      }
    } catch {
      setMessage("Помилка мережі");
    }
    setLoading(false);
  };

  const margin = form.salePrice - form.costPrice;

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Basic info */}
      <fieldset className="space-y-3 rounded-xl border border-slate-200/70 p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Основна інформація</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Назва *" name="name" value={form.name} onChange={(v) => set("name", v)} required />
          <Field label="Slug (авто)" name="slug" value={form.slug} onChange={(v) => set("slug", v)} placeholder="авто-генерація" />
          <Field label="Артикул (SKU) *" name="sku" value={form.sku} onChange={(v) => set("sku", v)} required />
          <Field label="Бренд *" name="brand" value={form.brand} onChange={(v) => set("brand", v)} required />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-slate-500">Опис</label>
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            placeholder="Опис товару..."
          />
        </div>
      </fieldset>

      {/* Category / Supplier */}
      <fieldset className="space-y-3 rounded-xl border border-slate-200/70 p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Категорія та постачальник</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-slate-500">Категорія *</label>
            <select
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Оберіть категорію</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-500">Постачальник *</label>
            <select
              value={form.supplierId}
              onChange={(e) => set("supplierId", e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Оберіть постачальника</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {/* Pricing */}
      <fieldset className="space-y-3 rounded-xl border border-slate-200/70 p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ціни</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Закупівельна *" name="costPrice" type="number" value={String(form.costPrice || "")} onChange={(v) => set("costPrice", Number(v))} required />
          <Field label="Продажна *" name="salePrice" type="number" value={String(form.salePrice || "")} onChange={(v) => set("salePrice", Number(v))} required />
          <Field label="Стара ціна (для знижки)" name="oldPrice" type="number" value={String(form.oldPrice || "")} onChange={(v) => set("oldPrice", v ? Number(v) : null)} />
        </div>
        {form.costPrice > 0 && form.salePrice > 0 && (
          <div className="rounded-lg bg-[var(--lilac-50)] px-3 py-2 text-xs text-slate-600">
            Маржа: <strong>{formatPrice(margin)}</strong> ({margin > 0 ? ((margin / form.salePrice) * 100).toFixed(1) : 0}%)
          </div>
        )}
      </fieldset>

      {/* Stock & Delivery */}
      <fieldset className="space-y-3 rounded-xl border border-slate-200/70 p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Наявність та доставка</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => set("inStock", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label className="text-sm text-slate-700">В наявності</label>
          </div>
          <Field label="Залишок (шт.)" name="stockQty" type="number" value={String(form.stockQty || "")} onChange={(v) => set("stockQty", v ? Number(v) : null)} />
          <Field label="Популярність (1-100)" name="popularity" type="number" value={String(form.popularity)} onChange={(v) => set("popularity", Number(v))} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Термін (від, днів)" name="leadTimeMinDays" type="number" value={String(form.leadTimeMinDays)} onChange={(v) => set("leadTimeMinDays", Number(v))} />
          <Field label="Термін (до, днів)" name="leadTimeMaxDays" type="number" value={String(form.leadTimeMaxDays)} onChange={(v) => set("leadTimeMaxDays", Number(v))} />
        </div>
      </fieldset>

      {/* Labels */}
      <fieldset className="space-y-3 rounded-xl border border-slate-200/70 p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Ярлики</legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isDeal} onChange={(e) => set("isDeal", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] text-white">Акція</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isOutlet} onChange={(e) => set("isOutlet", e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
            <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[10px] text-white">Уцінка</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={!!form.oldPrice} disabled className="h-4 w-4 rounded border-slate-300" />
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-white">Знижка</span>
            <span className="text-[10px] text-slate-400">(авто, якщо є стара ціна)</span>
          </label>
        </div>
      </fieldset>

      {/* Images */}
      <fieldset className="space-y-3 rounded-xl border border-slate-200/70 p-4">
        <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Фото (URL)</legend>
        <div className="flex gap-2">
          <input
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="https://... або /images/photo.jpg"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button type="button" onClick={addImage} className="shrink-0 rounded-full bg-lilac px-4 py-2 text-xs text-white">
            Додати
          </button>
        </div>
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.images.map((url, i) => (
              <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-contain p-1" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {form.images.length === 0 && (
          <div className="text-xs text-slate-400">Буде використано placeholder</div>
        )}
      </fieldset>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-lilac px-6 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Збереження..." : isEdit ? "Зберегти зміни" : "Додати товар"}
        </button>
        {message && (
          <div className={`text-xs ${message.startsWith("Помилка") ? "text-red-600" : "text-emerald-600"}`}>
            {message}
          </div>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-slate-500">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
    </div>
  );
}
