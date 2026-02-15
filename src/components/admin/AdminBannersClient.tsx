"use client";

import { useState } from "react";
import Image from "next/image";

type Banner = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string;
  position: number;
  isActive: boolean;
};

const EMPTY: Omit<Banner, "id"> = {
  type: "tile",
  title: "",
  subtitle: "",
  imageUrl: "",
  linkUrl: "",
  position: 0,
  isActive: true,
};

export function AdminBannersClient({
  initialBanners,
}: {
  initialBanners: Banner[];
}) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (key: string, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (b: Banner) => {
    setEditId(b.id);
    setForm({
      type: b.type,
      title: b.title,
      subtitle: b.subtitle || "",
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl,
      position: b.position,
      isActive: b.isActive,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.title || !form.imageUrl || !form.linkUrl) {
      setMsg("Заповніть обовʼязкові поля");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      if (editId) {
        const res = await fetch(`/api/admin/banners/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Помилка оновлення");
        setBanners((prev) =>
          prev.map((b) => (b.id === editId ? { ...b, ...form } : b)),
        );
        setMsg("Банер оновлено ✓");
      } else {
        const res = await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Помилка створення");
        const data = await res.json();
        setBanners((prev) => [...prev, { id: data.id, ...form }]);
        setMsg("Банер створено ✓");
      }
      setShowForm(false);
      setEditId(null);
    } catch {
      setMsg("Сталась помилка");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b: Banner) => {
    const newVal = !b.isActive;
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isActive: newVal }),
    });
    setBanners((prev) =>
      prev.map((x) => (x.id === b.id ? { ...x, isActive: newVal } : x)),
    );
  };

  const remove = async (b: Banner) => {
    if (!confirm(`Видалити банер "${b.title}"?`)) return;
    await fetch(`/api/admin/banners/${b.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setBanners((prev) => prev.filter((x) => x.id !== b.id));
  };

  const heroBanners = banners.filter((b) => b.type === "hero");
  const tileBanners = banners.filter((b) => b.type === "tile");

  return (
    <div className="space-y-6">
      {/* actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={openCreate}
          className="rounded-full bg-lilac px-5 py-2 text-xs text-white"
        >
          + Додати банер
        </button>
        {msg && (
          <span className="text-xs text-emerald-600">{msg}</span>
        )}
      </div>

      {/* form */}
      {showForm && (
        <div className="rounded-xl border border-lilac/30 bg-[var(--lilac-50)]/30 p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            {editId ? "Редагувати банер" : "Новий банер"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* type */}
            <label className="block text-xs text-slate-600">
              Тип
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="hero">Головний банер (hero)</option>
                <option value="tile">Плитка (tile)</option>
              </select>
            </label>

            {/* position */}
            <label className="block text-xs text-slate-600">
              Позиція (порядок)
              <input
                type="number"
                value={form.position}
                onChange={(e) => set("position", Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            {/* title */}
            <label className="block text-xs text-slate-600 sm:col-span-2">
              Заголовок *
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Знижки до -40%"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            {/* subtitle */}
            <label className="block text-xs text-slate-600 sm:col-span-2">
              Підзаголовок
              <input
                type="text"
                value={form.subtitle || ""}
                onChange={(e) => set("subtitle", e.target.value)}
                placeholder="Тільки цього тижня на процесори AMD"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            {/* imageUrl */}
            <label className="block text-xs text-slate-600 sm:col-span-2">
              URL зображення *
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            {/* image preview */}
            {form.imageUrl && (
              <div className="sm:col-span-2">
                <div className="relative h-36 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 sm:h-48">
                  <Image
                    src={form.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* linkUrl */}
            <label className="block text-xs text-slate-600 sm:col-span-2">
              URL посилання *
              <input
                type="text"
                value={form.linkUrl}
                onChange={(e) => set("linkUrl", e.target.value)}
                placeholder="/catalog?deal=true"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>

            {/* isActive */}
            <label className="flex items-center gap-2 text-xs text-slate-600 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="rounded border-slate-300"
              />
              Активний
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-lilac px-6 py-2 text-xs text-white disabled:opacity-50"
            >
              {saving ? "Зберігаю…" : editId ? "Зберегти зміни" : "Створити"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="rounded-full border border-slate-200 px-5 py-2 text-xs text-slate-600"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* hero banners section */}
      <div className="rounded-xl border border-slate-200/70 bg-white text-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Головні банери — Hero ({heroBanners.length})
        </div>
        {heroBanners.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-slate-400">
            Немає hero-банерів
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {heroBanners.map((b) => (
              <BannerRow
                key={b.id}
                banner={b}
                onEdit={() => openEdit(b)}
                onToggle={() => toggleActive(b)}
                onDelete={() => remove(b)}
              />
            ))}
          </div>
        )}
      </div>

      {/* tile banners section */}
      <div className="rounded-xl border border-slate-200/70 bg-white text-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Плитки — Tile ({tileBanners.length})
        </div>
        {tileBanners.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-slate-400">
            Немає плиток
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tileBanners.map((b) => (
              <BannerRow
                key={b.id}
                banner={b}
                onEdit={() => openEdit(b)}
                onToggle={() => toggleActive(b)}
                onDelete={() => remove(b)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---- reusable row ---- */
function BannerRow({
  banner,
  onEdit,
  onToggle,
  onDelete,
}: {
  banner: Banner;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* thumbnail */}
      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        <Image
          src={banner.imageUrl}
          alt={banner.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-slate-900">
            {banner.title}
          </span>
          {!banner.isActive && (
            <span className="rounded-full bg-slate-300 px-1.5 py-0.5 text-[10px] text-white">
              Вимкнено
            </span>
          )}
        </div>
        {banner.subtitle && (
          <div className="mt-0.5 truncate text-[11px] text-slate-500">
            {banner.subtitle}
          </div>
        )}
        <div className="mt-0.5 text-[10px] text-slate-400">
          Позиція: {banner.position} · {banner.linkUrl}
        </div>
      </div>

      {/* actions */}
      <div className="flex shrink-0 flex-wrap gap-1">
        <button
          onClick={onToggle}
          className={`rounded-full border px-3 py-1 text-[11px] ${
            banner.isActive
              ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              : "border-slate-200 text-slate-500 hover:bg-slate-50"
          }`}
        >
          {banner.isActive ? "Вимкнути" : "Увімкнути"}
        </button>
        <button
          onClick={onEdit}
          className="rounded-full border border-lilac px-3 py-1 text-[11px] text-slate-700 hover:bg-[var(--lilac-50)]"
        >
          Редагувати
        </button>
        <button
          onClick={onDelete}
          className="rounded-full border border-red-200 px-3 py-1 text-[11px] text-red-600 hover:bg-red-50"
        >
          Видалити
        </button>
      </div>
    </div>
  );
}
