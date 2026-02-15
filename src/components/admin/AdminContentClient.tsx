"use client";

import { useState } from "react";

type ContentPage = {
  id: string;
  slug: string;
  titleUa: string;
  titleRu: string;
};

export function AdminContentClient({ pages }: { pages: ContentPage[] }) {
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    setMessage(res.ok ? "Збережено" : "Помилка");
    if (res.ok) window.location.reload();
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="grid gap-3 rounded-xl border border-slate-200/70 bg-white p-4 text-sm"
      >
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Додати / оновити сторінку</div>
        <input name="slug" placeholder="Slug (напр. delivery, about)" required className="rounded-lg border border-slate-200 px-3 py-2" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="titleUa" placeholder="Заголовок (UA)" required className="rounded-lg border border-slate-200 px-3 py-2" />
          <input name="titleRu" placeholder="Заголовок (RU)" required className="rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <textarea name="bodyUa" placeholder="Текст (UA)" rows={3} className="rounded-lg border border-slate-200 px-3 py-2" />
        <textarea name="bodyRu" placeholder="Текст (RU)" rows={3} className="rounded-lg border border-slate-200 px-3 py-2" />
        <button className="w-fit rounded-full bg-lilac px-4 py-2 text-xs text-white">
          Зберегти
        </button>
        {message && <div className="text-xs text-slate-500">{message}</div>}
      </form>

      <div className="rounded-xl border border-slate-200/70 bg-white p-4 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Існуючі сторінки</div>
        <div className="mt-3 divide-y divide-slate-100">
          {pages.map((p) => (
            <div key={p.id} className="flex justify-between py-2">
              <span className="text-slate-400">{p.slug}</span>
              <span className="font-medium text-slate-900">{p.titleUa}</span>
            </div>
          ))}
          {pages.length === 0 && (
            <div className="py-4 text-center text-slate-400">Сторінок поки немає</div>
          )}
        </div>
      </div>
    </div>
  );
}
