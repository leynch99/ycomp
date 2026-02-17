"use client";

import { useState } from "react";
import Image from "next/image";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: Date | string;
};

const EMPTY = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  imageUrl: "",
  isPublished: true,
};

export function AdminBlogClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditId(p.id);
    setForm({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || "",
      body: p.body,
      imageUrl: p.imageUrl || "",
      isPublished: p.isPublished,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.slug.trim() || !form.title.trim() || !form.body.trim()) {
      setMsg("Заповніть slug, заголовок та текст");
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        ...form,
        slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      };
      if (editId) {
        const res = await fetch(`/api/admin/blog/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Помилка оновлення");
        setPosts((prev) =>
          prev.map((p) => (p.id === editId ? { ...p, ...payload } : p)),
        );
        setMsg("Пост оновлено ✓");
      } else {
        const res = await fetch("/api/admin/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Помилка створення");
        const data = await res.json();
        setPosts((prev) => [{ id: data.id, ...payload, createdAt: new Date().toISOString() }, ...prev]);
        setMsg("Пост створено ✓");
      }
      setShowForm(false);
      setEditId(null);
    } catch {
      setMsg("Сталась помилка");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (p: BlogPost) => {
    const newVal = !p.isPublished;
    await fetch(`/api/admin/blog/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isPublished: newVal }),
    });
    setPosts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, isPublished: newVal } : x)),
    );
  };

  const remove = async (p: BlogPost) => {
    if (!confirm(`Видалити пост "${p.title}"?`)) return;
    await fetch(`/api/admin/blog/${p.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setPosts((prev) => prev.filter((x) => x.id !== p.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={openCreate}
          className="rounded-full bg-lilac px-5 py-2 text-xs text-white"
        >
          + Новий пост
        </button>
        {msg && <span className="text-xs text-emerald-600">{msg}</span>}
      </div>

      {showForm && (
        <div className="rounded-xl border border-lilac/30 bg-[var(--lilac-50)]/30 p-4 sm:p-5">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            {editId ? "Редагувати пост" : "Новий пост"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-slate-600 sm:col-span-2">
              Slug (URL) *
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="iak-zibraty-pk"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-slate-600 sm:col-span-2">
              Заголовок *
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-slate-600 sm:col-span-2">
              Короткий опис
              <input
                type="text"
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-slate-600 sm:col-span-2">
              Текст (Markdown) *
              <textarea
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                rows={12}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs text-slate-600 sm:col-span-2">
              URL зображення
              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </label>
            {form.imageUrl && (
              <div className="sm:col-span-2">
                <div className="relative h-36 w-full overflow-hidden rounded-lg border border-slate-200">
                  <Image src={form.imageUrl} alt="" fill className="object-cover" unoptimized />
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 text-xs text-slate-600 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => set("isPublished", e.target.checked)}
                className="rounded border-slate-300"
              />
              Опубліковано
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-full bg-lilac px-6 py-2 text-xs text-white disabled:opacity-50"
            >
              {saving ? "Зберігаю…" : editId ? "Зберегти" : "Створити"}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="rounded-full border border-slate-200 px-5 py-2 text-xs text-slate-600"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200/70 bg-white text-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Пости блогу ({posts.length})
        </div>
        {posts.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-slate-400">Немає постів</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                {p.imageUrl && (
                  <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200">
                    <Image src={p.imageUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-slate-900">{p.title}</span>
                    {!p.isPublished && (
                      <span className="rounded-full bg-slate-300 px-1.5 py-0.5 text-[10px] text-white">Чернетка</span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400">/{p.slug}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => togglePublished(p)}
                    className={`rounded-full border px-3 py-1 text-[11px] ${p.isPublished ? "border-emerald-200 text-emerald-600" : "border-slate-200 text-slate-500"}`}
                  >
                    {p.isPublished ? "Вимкнути" : "Опублікувати"}
                  </button>
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-full border border-lilac px-3 py-1 text-[11px] text-slate-700"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="rounded-full border border-red-200 px-3 py-1 text-[11px] text-red-600"
                  >
                    Видалити
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
