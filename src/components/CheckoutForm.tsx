"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { UKRAINIAN_CITIES } from "@/lib/ukrainian-cities";

type Carrier = "np" | "up";
type CityOption = { ref?: string; id?: string; name: string; region?: string };
type BranchOption = { ref?: string; id?: string; name: string; address?: string };

export function CheckoutForm() {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Delivery
  const [carrier, setCarrier] = useState<Carrier>("np");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [cityRef, setCityRef] = useState<string | null>(null);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchOption | null>(null);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchFallback, setBranchFallback] = useState<string | null>(null);
  const [manualBranch, setManualBranch] = useState("");

  // Resolve city Ref via API when city name selected
  useEffect(() => {
    setCityRef(null);
    setBranches([]);
    setSelectedBranch(null);
    setBranchFallback(null);
    setManualBranch("");
    if (!selectedCityName.trim()) return;

    const fetchRef = async () => {
      try {
        const endpoint =
          carrier === "np"
            ? `/api/delivery/np/cities?q=${encodeURIComponent(selectedCityName)}`
            : `/api/delivery/up/cities?q=${encodeURIComponent(selectedCityName)}`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          const cities: CityOption[] = data.cities ?? [];
          const q = selectedCityName.toLowerCase().trim();
          const exact = cities.find(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              q.includes(c.name.split(",")[0].toLowerCase()) ||
              q.includes(c.name.split(" ")[0].toLowerCase())
          );
          const pick = exact || cities[0];
          if (pick?.ref || pick?.id) setCityRef(String(pick.ref || pick.id));
        }
      } catch { /* ignore */ }
    };
    fetchRef();
  }, [selectedCityName, carrier]);

  // Load branches when city Ref resolved
  useEffect(() => {
    if (!cityRef) return;
    setBranchesLoading(true);
    setBranches([]);
    setSelectedBranch(null);
    setBranchFallback(null);

    (async () => {
      try {
        const endpoint =
          carrier === "np"
            ? `/api/delivery/np/branches?cityRef=${encodeURIComponent(cityRef)}`
            : `/api/delivery/up/branches?cityId=${encodeURIComponent(cityRef)}`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches ?? []);
          if (data.fallbackMessage) setBranchFallback(data.fallbackMessage);
        }
      } catch { /* ignore */ }
      setBranchesLoading(false);
    })();
  }, [cityRef, carrier]);

  const switchCarrier = (c: Carrier) => {
    setCarrier(c);
    setSelectedCityName("");
    setCityRef(null);
    setBranches([]);
    setSelectedBranch(null);
    setBranchFallback(null);
    setManualBranch("");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCityName.trim()) {
      setError("Оберіть місто доставки");
      return;
    }
    const branchDisplay = selectedBranch
      ? `${selectedBranch.name}${selectedBranch.address ? ` — ${selectedBranch.address}` : ""}`
      : manualBranch;
    if (!branchDisplay?.trim()) {
      setError("Оберіть відділення або вкажіть адресу");
      return;
    }
    setLoading(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const carrierLabel = carrier === "np" ? "Нова Пошта" : "Укрпошта";

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        city: selectedCityName,
        npBranch: `${carrierLabel}: ${branchDisplay}`,
        items,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setSuccess(data.number);
      clear();
      event.currentTarget.reset();
      switchCarrier("np");
    } else if (res.status === 429) {
      setError("Забагато спроб. Спробуйте через хвилину.");
    } else {
      setError("Помилка оформлення. Спробуйте ще раз.");
    }
    setLoading(false);
  };

  const citySelectClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm";
  const branchSelectClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4 sm:space-y-5">
        {/* Contact info */}
        <fieldset className="space-y-3 rounded-xl border border-slate-200/70 bg-white p-4 sm:rounded-2xl sm:p-6">
          <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Контактні дані</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="Імʼя" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input name="phone" required placeholder="+380XXXXXXXXX" pattern="\+380\d{9}" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input name="email" required type="email" placeholder="Email" className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2" />
          </div>
        </fieldset>

        {/* Delivery */}
        <fieldset className="space-y-4 rounded-xl border border-slate-200/70 bg-white p-4 sm:rounded-2xl sm:p-6">
          <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Доставка</legend>

          {/* Carrier selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => switchCarrier("np")}
              className={`rounded-xl border-2 p-3 text-left transition ${
                carrier === "np" ? "border-lilac bg-[var(--lilac-50)]" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-sm font-semibold text-slate-900">Нова Пошта</div>
              <div className="mt-1 text-[11px] text-slate-500">1–3 дні</div>
            </button>
            <button
              type="button"
              onClick={() => switchCarrier("up")}
              className={`rounded-xl border-2 p-3 text-left transition ${
                carrier === "up" ? "border-lilac bg-[var(--lilac-50)]" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-sm font-semibold text-slate-900">Укрпошта</div>
              <div className="mt-1 text-[11px] text-slate-500">3–7 днів</div>
            </button>
          </div>

          {/* City dropdown — готовий список міст */}
          <div>
            <label className="mb-1 block text-xs text-slate-500">Місто</label>
            <select
              value={selectedCityName}
              onChange={(e) => setSelectedCityName(e.target.value)}
              required
              className={citySelectClass}
            >
              <option value="">Оберіть місто</option>
              {UKRAINIAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Branch dropdown — завантажується через API після вибору міста */}
          <div>
            <label className="mb-1 block text-xs text-slate-500">
              Відділення {carrier === "np" ? "Нової Пошти" : "Укрпошти"}
            </label>
            {!selectedCityName ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500">
                Спочатку оберіть місто
              </div>
            ) : branchesLoading ? (
              <div className="rounded-lg border border-slate-200 px-3 py-3 text-xs text-slate-500">
                Завантаження відділень...
              </div>
            ) : branches.length > 0 ? (
              <select
                required
                value={selectedBranch ? (selectedBranch.ref || selectedBranch.id || "") : ""}
                onChange={(e) => {
                  const br = branches.find((b) => (b.ref || b.id) === e.target.value);
                  setSelectedBranch(br ?? null);
                }}
                className={branchSelectClass}
              >
                <option value="">Оберіть відділення</option>
                {branches.map((br) => (
                  <option key={br.ref || br.id} value={br.ref || br.id}>
                    {br.name}{br.address ? ` — ${br.address}` : ""}
                  </option>
                ))}
              </select>
            ) : branchFallback || (!branchesLoading && branches.length === 0) ? (
              <div>
                {branchFallback && <div className="mb-2 text-xs text-slate-500">{branchFallback}</div>}
                {!branchFallback && (
                  <div className="mb-2 text-xs text-slate-500">Не знайдено відділень. Вкажіть адресу вручну:</div>
                )}
                <input
                  value={manualBranch}
                  onChange={(e) => setManualBranch(e.target.value)}
                  required
                  placeholder="Адреса відділення (вулиця, номер)"
                  className={citySelectClass}
                />
              </div>
            ) : null}
          </div>
        </fieldset>

        {/* Payment */}
        <fieldset className="space-y-3 rounded-xl border border-slate-200/70 bg-white p-4 sm:rounded-2xl sm:p-6">
          <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Оплата</legend>
          <select name="paymentMethod" className={citySelectClass}>
            <option value="online">Онлайн</option>
            <option value="cod">Накладений платіж</option>
            <option value="bank">Безготівково</option>
          </select>
          <textarea
            name="comment"
            placeholder="Коментар до замовлення"
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </fieldset>
      </div>

      {/* Order summary */}
      <aside className="h-fit space-y-3 rounded-xl border border-lilac bg-white p-4 shadow-sm sm:space-y-4 sm:rounded-2xl sm:p-6 lg:sticky lg:top-32">
        <div className="text-xs font-semibold text-slate-900 sm:text-sm">Ваше замовлення</div>
        <div className="space-y-2 text-xs text-slate-600 sm:text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="truncate pr-2">{item.name} × {item.qty}</span>
              <span className="shrink-0">{formatPrice(item.salePrice * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs font-semibold sm:text-sm">
          <span>Разом</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="rounded-xl bg-[var(--lilac-50)] px-3 py-2 text-xs text-slate-600">
          Підтвердження менеджером протягом 15 хвилин
        </div>
        <button
          disabled={loading || items.length === 0}
          className="w-full rounded-full bg-lilac px-4 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Оформлюємо..." : "Підтвердити замовлення"}
        </button>
        {success && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Замовлення №{success} створено. Менеджер звʼяжеться з вами.
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
        )}
      </aside>
    </form>
  );
}
