"use client";

import { useState } from "react";

export function TradeInForm() {
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/trade-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? "Заявку надіслано" : "Помилка");
    if (res.ok) event.currentTarget.reset();
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200/70 bg-white p-6">
      <input
        name="deviceType"
        required
        placeholder="Тип пристрою"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        name="model"
        required
        placeholder="Модель"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <select name="condition" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
        <option value="good">Хороший стан</option>
        <option value="average">Середній стан</option>
        <option value="bad">Потребує ремонту</option>
      </select>
      <input
        name="photoUrl"
        placeholder="Фото (URL)"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        name="contacts"
        required
        placeholder="Контакти"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <textarea
        name="comment"
        placeholder="Коментар"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <button className="w-full rounded-full bg-lilac px-4 py-2 text-sm text-white">
        Надіслати заявку
      </button>
      {status && <div className="text-xs text-slate-500">{status}</div>}
    </form>
  );
}
