"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";

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
  const [cityQuery, setCityQuery] = useState("");
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchOption | null>(null);
  const [branchFallback, setBranchFallback] = useState<string | null>(null);
  const [manualBranch, setManualBranch] = useState("");
  const cityDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityInputRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // City search
  useEffect(() => {
    if (cityDebounce.current) clearTimeout(cityDebounce.current);
    if (cityQuery.trim().length < 2) {
      setCityOptions([]);
      return;
    }
    cityDebounce.current = setTimeout(async () => {
      try {
        const endpoint =
          carrier === "np"
            ? `/api/delivery/np/cities?q=${encodeURIComponent(cityQuery)}`
            : `/api/delivery/up/cities?q=${encodeURIComponent(cityQuery)}`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setCityOptions(data.cities ?? []);
          setShowCityDropdown(true);
        }
      } catch { /* ignore */ }
    }, 300);
    return () => { if (cityDebounce.current) clearTimeout(cityDebounce.current); };
  }, [cityQuery, carrier]);

  // Load branches when city selected
  useEffect(() => {
    setSelectedBranch(null);
    setBranches([]);
    setBranchFallback(null);
    setManualBranch("");
    if (!selectedCity) return;

    const ref = selectedCity.ref || selectedCity.id;
    if (!ref) return;

    (async () => {
      try {
        const endpoint =
          carrier === "np"
            ? `/api/delivery/np/branches?cityRef=${encodeURIComponent(ref)}`
            : `/api/delivery/up/branches?cityId=${encodeURIComponent(ref)}`;
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches ?? []);
          if (data.fallbackMessage) setBranchFallback(data.fallbackMessage);
        }
      } catch { /* ignore */ }
    })();
  }, [selectedCity, carrier]);

  // Reset delivery on carrier change
  const switchCarrier = (c: Carrier) => {
    setCarrier(c);
    setCityQuery("");
    setCityOptions([]);
    setSelectedCity(null);
    setBranches([]);
    setSelectedBranch(null);
    setBranchFallback(null);
    setManualBranch("");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const branchDisplay = selectedBranch
      ? `${selectedBranch.name}${selectedBranch.address ? ` — ${selectedBranch.address}` : ""}`
      : manualBranch;

    const carrierLabel = carrier === "np" ? "Нова Пошта" : "Укрпошта";

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        city: selectedCity?.name ?? cityQuery,
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

          {/* City search */}
          <div ref={cityInputRef} className="relative">
            <label className="mb-1 block text-xs text-slate-500">Місто</label>
            <input
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                setSelectedCity(null);
                setSelectedBranch(null);
              }}
              onFocus={() => { if (cityOptions.length > 0) setShowCityDropdown(true); }}
              placeholder="Почніть вводити назву міста..."
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {showCityDropdown && cityOptions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {cityOptions.map((city, i) => (
                  <button
                    type="button"
                    key={city.ref || city.id || i}
                    onClick={() => {
                      setCityQuery(city.name);
                      setSelectedCity(city);
                      setShowCityDropdown(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--lilac-50)]"
                  >
                    {city.name}
                    {city.region && <span className="ml-2 text-xs text-slate-400">{city.region}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Branch select */}
          {selectedCity && (
            <div>
              <label className="mb-1 block text-xs text-slate-500">
                Відділення {carrier === "np" ? "Нової Пошти" : "Укрпошти"}
              </label>
              {branches.length > 0 ? (
                <select
                  required
                  value={selectedBranch ? (selectedBranch.ref || selectedBranch.id || "") : ""}
                  onChange={(e) => {
                    const br = branches.find((b) => (b.ref || b.id) === e.target.value);
                    setSelectedBranch(br ?? null);
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">Оберіть відділення</option>
                  {branches.map((br) => (
                    <option key={br.ref || br.id} value={br.ref || br.id}>
                      {br.name}{br.address ? ` — ${br.address}` : ""}
                    </option>
                  ))}
                </select>
              ) : branchFallback ? (
                <div>
                  <div className="mb-2 text-xs text-slate-500">{branchFallback}</div>
                  <input
                    value={manualBranch}
                    onChange={(e) => setManualBranch(e.target.value)}
                    required
                    placeholder="Індекс або адреса відділення"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              ) : (
                <div className="text-xs text-slate-400">Завантаження відділень...</div>
              )}
            </div>
          )}
        </fieldset>

        {/* Payment */}
        <fieldset className="space-y-3 rounded-xl border border-slate-200/70 bg-white p-4 sm:rounded-2xl sm:p-6">
          <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Оплата</legend>
          <select name="paymentMethod" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
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
