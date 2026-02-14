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
        <input name="slug" placeholder="Slug" required className="rounded-lg border border-slate-200 px-3 py-2" />
        <input name="titleUa" placeholder="Title UA" required className="rounded-lg border border-slate-200 px-3 py-2" />
        <input name="titleRu" placeholder="Title RU" required className="rounded-lg border border-slate-200 px-3 py-2" />
        <textarea name="bodyUa" placeholder="Body UA" className="rounded-lg border border-slate-200 px-3 py-2" />
        <textarea name="bodyRu" placeholder="Body RU" className="rounded-lg border border-slate-200 px-3 py-2" />
        <button className="w-fit rounded-full bg-lilac px-4 py-2 text-xs text-white">
          Зберегти
        </button>
        {message && <div className="text-xs text-slate-500">{message}</div>}
      </form>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm">
        <div className="font-semibold text-slate-900">Сторінки</div>
        <div className="mt-3 space-y-2 text-slate-600">
          {pages.map((p) => (
            <div key={p.id} className="flex justify-between">
              <span>{p.slug}</span>
              <span>{p.titleUa}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
