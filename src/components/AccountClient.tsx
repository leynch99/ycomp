"use client";

import { useEffect, useState } from "react";

type OrderSummary = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
};

type User = { id: string; email: string; name: string | null; role: string } | null;

export function AccountClient({ user }: { user?: User }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setOrders(data?.orders ?? []))
      .catch(() => null);
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>, path: string) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage("Успішно");
        window.location.href = "/";
        return;
      }
      if (res.status === 429) {
        setMessage("Забагато спроб. Спробуйте через хвилину.");
        return;
      }
      const err = (data as { error?: string })?.error;
      if (err === "exists") setMessage("Цей email вже зареєстровано. Спробуйте увійти.");
      else if (err === "invalid") setMessage("Перевірте дані: пароль мінімум 6 символів.");
      else if (err === "server_error") setMessage("Помилка сервера. Спробуйте пізніше.");
      else setMessage("Помилка. Спробуйте пізніше.");
    } catch {
      setMessage("Помилка зʼєднання. Перевірте інтернет.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
        {user ? (
          <div className="space-y-4">
            <div className="text-sm text-slate-600">
              <div className="font-medium text-slate-900">{user.name || user.email}</div>
              <div className="mt-1 text-xs">{user.email}</div>
              <div className="mt-1 text-xs text-slate-400">Роль: {user.role}</div>
              {user.role === "ADMIN" && (
                <a
                  href="/admin"
                  className="mt-2 inline-block text-xs text-lilac hover:underline"
                >
                  → Адмін-панель
                </a>
              )}
            </div>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/";
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-[var(--lilac-500)]"
            >
              Вийти
            </button>
          </div>
        ) : (
          <>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setTab("login")}
            className={`rounded-full px-4 py-2 ${
              tab === "login" ? "bg-lilac text-white" : "border border-slate-200 text-slate-600"
            }`}
          >
            Вхід
          </button>
          <button
            onClick={() => setTab("register")}
            className={`rounded-full px-4 py-2 ${
              tab === "register" ? "bg-lilac text-white" : "border border-slate-200 text-slate-600"
            }`}
          >
            Реєстрація
          </button>
        </div>
        {tab === "login" ? (
          <form onSubmit={(event) => submit(event, "/api/auth/login")} className="mt-4 space-y-3">
            <input
              name="email"
              required
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="password"
              required
              type="password"
              placeholder="Пароль"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button className="w-full rounded-full bg-lilac px-4 py-2 text-sm text-white">
              Увійти
            </button>
          </form>
        ) : (
          <form
            onSubmit={(event) => submit(event, "/api/auth/register")}
            className="mt-4 space-y-3"
          >
            <input
              name="name"
              required
              placeholder="Імʼя"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="email"
              required
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              name="password"
              required
              type="password"
              minLength={6}
              placeholder="Пароль (мін. 6 символів)"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <button className="w-full rounded-full bg-lilac px-4 py-2 text-sm text-white">
              Створити акаунт
            </button>
          </form>
        )}
        {message && <div className="mt-3 text-xs text-slate-500">{message}</div>}
          </>
        )}
      </div>
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
        <div className="text-sm font-semibold text-slate-900">Мої замовлення</div>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          {orders.length === 0 && <div>Поки що немає замовлень.</div>}
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-2"
            >
              <span>№{order.number}</span>
              <span className="rounded-full border border-lilac px-2 py-1 text-[11px] text-slate-600">
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
