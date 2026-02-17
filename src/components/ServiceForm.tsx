"use client";

import { useState } from "react";

export function ServiceForm() {
  const [status, setStatus] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/service", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setStatus(res.ok ? "Заявку надіслано" : res.status === 429 ? "Забагато спроб. Спробуйте через хвилину." : "Помилка");
    if (res.ok) event.currentTarget.reset();
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200/70 bg-white p-6">
      <select name="serviceType" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
        <option value="diagnostic">Діагностика</option>
        <option value="cleaning">Чистка</option>
        <option value="assembly">Збірка</option>
        <option value="setup">Налаштування</option>
      </select>
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
