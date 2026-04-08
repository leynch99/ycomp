"use client";

import React, { useState } from "react";
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
  const [uploading, setUploading] = useState(false);
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

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        set("imageUrl", data.url);
        e.target.value = "";
      } else {
        setMsg(`Помилка: ${data.error || res.status}`);
      }
    } catch {
      setMsg("Помилка завантаження зображення");
    } finally {
      setUploading(false);
    }
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
          className="rounded-full bg-lilac px-5 py-2 text-xs text-white transition hover:bg-[var(--lilac-600)]"
        >
          + Додати банер
        </button>
        {msg && (
          <span className={`text-xs ${msg.includes('Помилка') ? "text-red-500" : "text-emerald-500"}`}>
            {msg}
          </span>
        )}
      </div>

      {/* form */}
      {showForm && (
        <div className="rounded-xl border border-lilac/30 dark:border-white/10 bg-[var(--lilac-50)]/30 dark:bg-slate-800/50 p-4 sm:p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-white">
            {editId ? "Редагувати банер" : "Новий банер"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* type */}
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Тип
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-[var(--lilac-500)] focus:ring-1 focus:ring-[var(--lilac-500)] outline-none transition"
              >
                <option value="hero">Головний банер (hero)</option>
                <option value="tile">Плитка (tile)</option>
              </select>
            </label>

            {/* position */}
            <label className="block text-xs text-slate-600 dark:text-slate-300">
              Позиція (порядок)
              <input
                type="number"
                value={form.position}
                onChange={(e) => set("position", Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-[var(--lilac-500)] focus:ring-1 focus:ring-[var(--lilac-500)] outline-none transition"
              />
            </label>

            {/* title */}
            <label className="block text-xs text-slate-600 dark:text-slate-300 sm:col-span-2">
              Заголовок *
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Знижки до -40%"
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-[var(--lilac-500)] focus:ring-1 focus:ring-[var(--lilac-500)] outline-none transition"
              />
            </label>

            {/* subtitle */}
            <label className="block text-xs text-slate-600 dark:text-slate-300 sm:col-span-2">
              Підзаголовок
              <input
                type="text"
                value={form.subtitle || ""}
                onChange={(e) => set("subtitle", e.target.value)}
                placeholder="Тільки цього тижня на процесори AMD"
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-[var(--lilac-500)] focus:ring-1 focus:ring-[var(--lilac-500)] outline-none transition"
              />
            </label>

            {/* imageUrl */}
            <div className="block text-xs text-slate-600 dark:text-slate-300 sm:col-span-2">
              <span className="mb-1 block">Зображення *</span>
              <div className="flex flex-wrap gap-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={uploadFile}
                  className="hidden"
                  id="banner-image-upload"
                />
                <label
                  htmlFor={uploading ? undefined : "banner-image-upload"}
                  className={`shrink-0 rounded-lg border px-4 py-2 text-xs font-medium transition flex items-center justify-center ${
                    uploading
                      ? "cursor-not-allowed border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 text-slate-500 pointer-events-none"
                      : "cursor-pointer border-lilac bg-white dark:bg-[var(--lilac-900)]/20 text-lilac dark:text-lilac-400 hover:bg-[var(--lilac-50)] dark:hover:bg-[var(--lilac-900)]/40"
                  }`}
                >
                  {uploading ? "Завантаження..." : "Завантажити з ПК"}
                </label>
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                    placeholder="або вставте URL-посилання..."
                    className="block w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-[var(--lilac-500)] focus:ring-1 focus:ring-[var(--lilac-500)] outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* image preview */}
            {form.imageUrl && (
              <div className="sm:col-span-2">
                <div className="relative h-40 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900 shadow-inner sm:h-56">
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
            <label className="block text-xs text-slate-600 dark:text-slate-300 sm:col-span-2">
              URL посилання *
              <input
                type="text"
                value={form.linkUrl}
                onChange={(e) => set("linkUrl", e.target.value)}
                placeholder="/catalog?deal=true"
                className="mt-1 block w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-3 py-2 text-sm dark:text-white focus:border-[var(--lilac-500)] focus:ring-1 focus:ring-[var(--lilac-500)] outline-none transition"
              />
            </label>

            {/* isActive switch */}
            <div className="flex items-center justify-between sm:col-span-2 rounded-lg border border-slate-200 dark:border-white/10 p-3 mt-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Опубліковано (активний)
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => set("isActive", !form.isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  form.isActive ? "bg-lilac" : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    form.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-lilac px-6 py-2.5 text-xs font-semibold text-white shadow-md disabled:opacity-50 transition hover:bg-[var(--lilac-600)]"
            >
              {saving ? "Зберігаю…" : editId ? "Зберегти зміни" : "Створити"}
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditId(null);
              }}
              className="rounded-full border border-slate-200 dark:border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* hero banners section */}
      <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm overflow-hidden text-sm">
        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Головні банери — Hero ({heroBanners.length})
        </div>
        {heroBanners.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-slate-400">
            Немає hero-банерів
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
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
      <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900 shadow-sm overflow-hidden text-sm">
        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Плитки — Tile ({tileBanners.length})
        </div>
        {tileBanners.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-slate-400">
            Немає плиток
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
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
    <div className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
      {/* thumbnail */}
      <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 dark:border-white/10 bg-slate-50">
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
          <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
            {banner.title}
          </span>
          {!banner.isActive && (
            <span className="rounded-full bg-slate-300 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] text-white">
              Вимкнено
            </span>
          )}
        </div>
        {banner.subtitle && (
          <div className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
            {banner.subtitle}
          </div>
        )}
        <div className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
          Позиція: {banner.position} · {banner.linkUrl}
        </div>
      </div>

      {/* actions */}
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          onClick={onToggle}
          className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
            banner.isActive
              ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-900/50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
              : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          {banner.isActive ? "Вимкнути" : "Увімкнути"}
        </button>
        <button
          onClick={onEdit}
          className="rounded-full border border-lilac text-lilac px-3 py-1 text-[11px] font-medium hover:bg-[var(--lilac-50)] dark:border-lilac-500/50 dark:text-lilac-400 dark:hover:bg-[var(--lilac-900)]/20 transition"
        >
          Редагувати
        </button>
        <button
          onClick={onDelete}
          className="rounded-full border border-red-200 text-red-600 px-3 py-1 text-[11px] font-medium hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20 transition"
        >
          Видалити
        </button>
      </div>
    </div>
  );
}
