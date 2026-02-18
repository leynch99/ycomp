"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type OrderSummary = {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
  items?: { name: string; qty: number; price: number }[];
};

type User = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  birthDate: string | null;
  role: string;
} | null;

type Section = "profile" | "orders" | "wishlist" | "password" | "login";

export function AccountClient({ user }: { user?: User }) {
  const [section, setSection] = useState<Section>(user ? "profile" : "login");
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  // Profile editing
  const [profileName, setProfileName] = useState(user?.name ?? "");
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? "");
  const [profileBirthDate, setProfileBirthDate] = useState(
    user?.birthDate ? user.birthDate.slice(0, 10) : ""
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password change
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  // Registration
  const [regError, setRegError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/account/orders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setOrders(data?.orders ?? []))
      .catch(() => null);
  }, [user]);

  const submitAuth = async (event: React.FormEvent<HTMLFormElement>, path: string) => {
    event.preventDefault();
    setMessage(null);
    setRegError(null);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    if (path === "/api/auth/register") {
      if (payload.password !== payload.confirmPassword) {
        setRegError("Паролі не співпадають");
        return;
      }
    }

    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      if (res.status === 429) {
        setMessage("Забагато спроб. Спробуйте через хвилину.");
        return;
      }
      const err = (data as { error?: string })?.error;
      if (err === "exists") setRegError("Цей email вже зареєстровано.");
      else if (err === "passwords_mismatch") setRegError("Паролі не співпадають.");
      else if (err === "phone_invalid") setRegError("Невірний формат телефону (+380XXXXXXXXX).");
      else if (err === "name_required") setRegError("Вкажіть прізвище та імʼя.");
      else if (err === "invalid") setMessage("Перевірте дані: пароль мінімум 6 символів.");
      else setMessage("Помилка. Спробуйте пізніше.");
    } catch {
      setMessage("Помилка зʼєднання.");
    }
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
          birthDate: profileBirthDate || null,
        }),
      });
      if (res.ok) setProfileMsg("Збережено");
      else setProfileMsg("Помилка збереження");
    } catch {
      setProfileMsg("Помилка зʼєднання");
    }
    setProfileSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== confirmPwd) {
      setPwdMsg("Паролі не співпадають");
      return;
    }
    if (newPwd.length < 6) {
      setPwdMsg("Пароль мінімум 6 символів");
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPwdMsg("Пароль змінено");
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
      } else {
        const err = (data as { error?: string })?.error;
        if (err === "wrong_password") setPwdMsg("Невірний поточний пароль");
        else setPwdMsg("Помилка");
      }
    } catch {
      setPwdMsg("Помилка зʼєднання");
    }
    setPwdSaving(false);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => { setAuthTab("login"); setMessage(null); setRegError(null); }}
              className={`rounded-full px-4 py-2 ${authTab === "login" ? "bg-lilac text-white" : "border border-slate-200 text-slate-600"}`}
            >
              Вхід
            </button>
            <button
              onClick={() => { setAuthTab("register"); setMessage(null); setRegError(null); }}
              className={`rounded-full px-4 py-2 ${authTab === "register" ? "bg-lilac text-white" : "border border-slate-200 text-slate-600"}`}
            >
              Реєстрація
            </button>
          </div>

          {authTab === "login" ? (
            <form onSubmit={(e) => submitAuth(e, "/api/auth/login")} className="mt-4 space-y-3">
              <input name="email" required type="email" placeholder="Email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="password" required type="password" placeholder="Пароль" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <button className="w-full rounded-full bg-lilac px-4 py-2 text-sm text-white">Увійти</button>
            </form>
          ) : (
            <form onSubmit={(e) => submitAuth(e, "/api/auth/register")} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="lastName" required placeholder="Прізвище" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input name="firstName" required placeholder="Імʼя" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <input name="phone" required placeholder="+380XXXXXXXXX" pattern="\+380\d{9}" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="email" required type="email" placeholder="Email" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="password" required type="password" minLength={6} placeholder="Пароль (мін. 6 символів)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input name="confirmPassword" required type="password" minLength={6} placeholder="Підтвердіть пароль" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              {regError && <div className="text-xs text-red-600">{regError}</div>}
              <button className="w-full rounded-full bg-lilac px-4 py-2 text-sm text-white">Створити акаунт</button>
            </form>
          )}
          {message && <div className="mt-3 text-xs text-slate-500">{message}</div>}
        </div>
      </div>
    );
  }

  const nameParts = user.name?.split(" ") ?? [];
  const initials = nameParts.map((p) => p[0]).join("").toUpperCase().slice(0, 2) || "U";

  const sidebarItems: { key: Section; icon: string; label: string }[] = [
    { key: "profile", icon: "👤", label: "Особисті дані" },
    { key: "orders", icon: "📦", label: "Мої замовлення" },
    { key: "wishlist", icon: "♥", label: "Список бажань" },
    { key: "password", icon: "🔒", label: "Зміна паролю" },
  ];

  const statusLabels: Record<string, string> = {
    NEW: "Новий",
    CONFIRMED: "Підтверджено",
    SENT_TO_SUPPLIER: "Відправлено постачальнику",
    SHIPPED: "Відправлено",
    DELIVERED: "Доставлено",
    CLOSED: "Завершено",
    CANCELLED: "Скасовано",
    RETURN_REQUESTED: "Запит на повернення",
    RETURNED: "Повернено",
  };

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-1 rounded-2xl border border-slate-200/70 bg-white p-4">
        <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lilac text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{user.name || user.email}</div>
            <div className="truncate text-xs text-slate-500">{user.email}</div>
          </div>
        </div>

        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setSection(item.key)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
              section === item.key
                ? "bg-[var(--lilac-50)] font-medium text-[var(--lilac-900)]"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {user.role === "ADMIN" && (
          <a
            href="/admin"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"
          >
            <span className="text-base">⚙</span>
            Адмін-панель
          </a>
        )}

        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <span className="text-base">🚪</span>
          Вихід
        </button>
      </aside>

      {/* Content */}
      <div className="min-w-0 rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-6">
        {section === "profile" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Особисті дані</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Прізвище, Імʼя</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Email</label>
                <input
                  value={user.email}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Телефон</label>
                <input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+380XXXXXXXXX"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Дата народження</label>
                <input
                  type="date"
                  value={profileBirthDate}
                  onChange={(e) => setProfileBirthDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveProfile}
                disabled={profileSaving}
                className="rounded-full bg-lilac px-5 py-2 text-sm text-white disabled:opacity-50"
              >
                {profileSaving ? "Збереження..." : "Зберегти"}
              </button>
              {profileMsg && (
                <span className={`text-xs ${profileMsg === "Збережено" ? "text-emerald-600" : "text-red-600"}`}>
                  {profileMsg}
                </span>
              )}
            </div>
          </div>
        )}

        {section === "orders" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Мої замовлення</h2>
            {orders.length === 0 ? (
              <div className="text-sm text-slate-500">Поки що немає замовлень.</div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-slate-200/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-slate-900">№{order.number}</span>
                        <span className="ml-3 text-xs text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString("uk-UA")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[var(--lilac-50)] px-3 py-1 text-xs font-medium text-[var(--lilac-900)]">
                          {statusLabels[order.status] ?? order.status}
                        </span>
                        <span className="text-sm font-semibold text-slate-900">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === "wishlist" && <WishlistSection />}

        {section === "password" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Зміна паролю</h2>
            <form onSubmit={changePassword} className="max-w-md space-y-4">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Поточний пароль</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Новий пароль</label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-500">Підтвердіть пароль</label>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={pwdSaving}
                  className="rounded-full bg-lilac px-5 py-2 text-sm text-white disabled:opacity-50"
                >
                  {pwdSaving ? "Збереження..." : "Зберегти"}
                </button>
                {pwdMsg && (
                  <span className={`text-xs ${pwdMsg === "Пароль змінено" ? "text-emerald-600" : "text-red-600"}`}>
                    {pwdMsg}
                  </span>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function WishlistSection() {
  const [items, setItems] = useState<{ id: string; name: string; slug: string; salePrice: number; image?: string }[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ycomp_wishlist");
      if (raw) setItems(JSON.parse(raw));
    } catch { /* empty */ }
  }, []);

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem("ycomp_wishlist", JSON.stringify(next));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Список бажань</h2>
      {items.length === 0 ? (
        <div className="text-sm text-slate-500">Список бажань порожній.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200/70 p-3">
              <a href={`/p/${item.slug}`} className="text-sm font-medium text-slate-900 hover:text-lilac">
                {item.name}
              </a>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatPrice(item.salePrice)}</span>
                <button onClick={() => remove(item.id)} className="text-xs text-slate-400 hover:text-red-500">
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
