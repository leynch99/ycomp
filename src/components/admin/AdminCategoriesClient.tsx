"use client";

import { useState } from "react";

type CategoryRow = { id: string; name: string; slug: string };

export function AdminCategoriesClient({ categories }: { categories: CategoryRow[] }) {
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/admin/categories", {
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
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Додати категорію</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Назва" required className="rounded-lg border border-slate-200 px-3 py-2" />
          <input name="slug" placeholder="Slug (латиницею)" required className="rounded-lg border border-slate-200 px-3 py-2" />
        </div>
        <button className="w-fit rounded-full bg-lilac px-4 py-2 text-xs text-white">
          Додати
        </button>
        {message && <div className="text-xs text-slate-500">{message}</div>}
      </form>

      <div className="rounded-xl border border-slate-200/70 bg-white p-4 text-sm">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Існуючі категорії</div>
        <div className="mt-3 divide-y divide-slate-100">
          {categories.map((cat) => (
            <div key={cat.id} className="flex justify-between py-2">
              <span className="font-medium text-slate-900">{cat.name}</span>
              <span className="text-slate-400">{cat.slug}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
