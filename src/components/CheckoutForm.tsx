"use client";

import { useEffect, useState, useRef } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";
import { UKRAINIAN_CITIES } from "@/lib/ukrainian-cities";

type Carrier = "np" | "up";
type CityOption = { ref?: string; id?: string; name: string; region?: string };
type BranchOption = { ref?: string; id?: string; name: string; address?: string };

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.startsWith("380")) {
    const rest = d.slice(3, 12);
    return `+380 ${rest.slice(0, 2)} ${rest.slice(2, 5)} ${rest.slice(5, 7)} ${rest.slice(7)}`.trim();
  }
  return value;
}

function normalizePhoneForSubmit(value: string): string {
  const d = value.replace(/\D/g, "");
  if (d.length >= 9) return `+380${d.slice(-9)}`;
  return `+380${d}`;
}

export function CheckoutForm() {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Steps: 1=contacts, 2=delivery, 3=payment
  const [step, setStep] = useState(1);
  const contactsRef = useRef<HTMLFieldSetElement>(null);
  const deliveryRef = useRef<HTMLFieldSetElement>(null);
  const paymentRef = useRef<HTMLFieldSetElement>(null);

  // Contact fields (controlled for masks)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Delivery
  const [carrier, setCarrier] = useState<Carrier>("np");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [cityRef, setCityRef] = useState<string | null>(null);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchOption | null>(null);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchFallback, setBranchFallback] = useState<string | null>(null);
  const [manualBranch, setManualBranch] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [comment, setComment] = useState("");

  // Auto-fill from last order
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/account/checkout-defaults", { credentials: "include" });
        if (!res.ok) return;
        const { defaults } = await res.json();
        if (!defaults) return;
        if (defaults.name) setName(defaults.name);
        if (defaults.phone) setPhone(formatPhone(defaults.phone));
        else if (defaults.phone === "") setPhone("");
        if (defaults.email) setEmail(defaults.email);
        if (defaults.city) setSelectedCityName(defaults.city);
        if (defaults.paymentMethod) setPaymentMethod(defaults.paymentMethod);

        if (defaults.npBranch) {
          const s = defaults.npBranch;
          if (s.startsWith("Укрпошта:")) {
            setCarrier("up");
            setManualBranch(s.replace(/^Укрпошта:\s*/, "").trim());
          } else if (s.startsWith("Нова Пошта:")) {
            setCarrier("np");
            setManualBranch(s.replace(/^Нова Пошта:\s*/, "").trim());
          }
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // Resolve city Ref via API when city name selected
  useEffect(() => {
    setCityRef(null);
    setBranches([]);
    setSelectedBranch(null);
    setBranchFallback(null);
    setManualBranch((prev) => (selectedCityName.trim() ? prev : ""));
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
          const brs: BranchOption[] = data.branches ?? [];
          setBranches(brs);
          if (data.fallbackMessage) setBranchFallback(data.fallbackMessage);

          // Auto-select branch if manualBranch matches any branch
          if (manualBranch.trim() && brs.length > 0) {
            const m = manualBranch.toLowerCase();
            const match = brs.find(
              (b) =>
                m.includes(b.name.toLowerCase()) ||
                (b.name.toLowerCase().includes(m.split("—")[0].trim())) ||
                (b.address && (m.includes(b.address.toLowerCase()) || b.address.toLowerCase().includes(m)))
            );
            if (match) {
              setSelectedBranch(match);
              setManualBranch("");
            }
          }
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

  const validateStep = (s: number): boolean => {
    if (s === 1) {
      const n = name.trim();
      const p = phone.replace(/\D/g, "");
      const e = email.trim();
      if (!n) {
        setError("Введіть імʼя");
        contactsRef.current?.scrollIntoView({ behavior: "smooth" });
        return false;
      }
      if (p.length < 9) {
        setError("Введіть коректний телефон (+380XXXXXXXXX)");
        contactsRef.current?.scrollIntoView({ behavior: "smooth" });
        return false;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!e || !emailRe.test(e)) {
        setError("Введіть коректний email");
        contactsRef.current?.scrollIntoView({ behavior: "smooth" });
        return false;
      }
    }
    if (s === 2) {
      if (!selectedCityName.trim()) {
        setError("Оберіть місто доставки");
        deliveryRef.current?.scrollIntoView({ behavior: "smooth" });
        return false;
      }
      const branchDisplay = selectedBranch
        ? `${selectedBranch.name}${selectedBranch.address ? ` — ${selectedBranch.address}` : ""}`
        : manualBranch;
      if (!branchDisplay?.trim()) {
        setError("Оберіть відділення або вкажіть адресу");
        deliveryRef.current?.scrollIntoView({ behavior: "smooth" });
        return false;
      }
    }
    setError(null);
    return true;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep(1) || !validateStep(2)) return;

    const branchDisplay = selectedBranch
      ? `${selectedBranch.name}${selectedBranch.address ? ` — ${selectedBranch.address}` : ""}`
      : manualBranch;
    setLoading(true);
    setSuccess(null);
    setError(null);

    const carrierLabel = carrier === "np" ? "Нова Пошта" : "Укрпошта";
    const payload = {
      name: name.trim(),
      phone: normalizePhoneForSubmit(phone),
      email: email.trim(),
      city: selectedCityName,
      npBranch: `${carrierLabel}: ${branchDisplay}`,
      paymentMethod,
      comment: comment.trim() || undefined,
      items,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      setSuccess(data.number);
      clear();
      setStep(1);
      setName("");
      setPhone("");
      setEmail("");
      switchCarrier("np");
    } else if (res.status === 429) {
      setError("Забагато спроб. Спробуйте через хвилину.");
    } else {
      setError("Помилка оформлення. Спробуйте ще раз.");
    }
    setLoading(false);
  };

  const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm";
  const labelClass = "mb-1 block text-xs text-slate-500";
  const requiredMark = <span className="text-red-500">*</span>;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4 sm:space-y-5">
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
                step === s
                  ? "bg-lilac text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {s === 1 ? "Контакти" : s === 2 ? "Доставка" : "Оплата"}
            </button>
          ))}
        </div>

        {/* Step 1: Contact info */}
        <fieldset
          ref={contactsRef}
          className={`space-y-3 rounded-xl border border-slate-200/70 bg-white p-4 sm:rounded-2xl sm:p-6 ${
            step < 1 ? "opacity-60" : ""
          }`}
        >
          <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Контактні дані {requiredMark}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Імʼя {requiredMark}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ваше імʼя"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Телефон {requiredMark}</label>
              <input
                value={phone}
                onChange={(e) => {
                  let v = e.target.value;
                  const d = v.replace(/\D/g, "");
                  if (d.startsWith("8") || d.startsWith("0")) {
                    v = "+380" + d.replace(/^[80]/, "").slice(0, 9);
                  } else if (!d.startsWith("380")) {
                    v = "+380" + d.slice(0, 9);
                  } else {
                    v = "+" + d.slice(0, 12);
                  }
                  setPhone(formatPhone(v));
                }}
                placeholder="+380 XX XXX XX XX"
                className={inputClass}
                maxLength={18}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Email {requiredMark}</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="example@gmail.com"
                className={inputClass}
              />
            </div>
          </div>
          {step === 1 && (
            <button
              type="button"
              onClick={goNext}
              className="mt-2 rounded-full border border-lilac px-4 py-2 text-sm text-lilac hover:bg-[var(--lilac-50)]"
            >
              Далі: Доставка →
            </button>
          )}
        </fieldset>

        {/* Step 2: Delivery */}
        <fieldset
          ref={deliveryRef}
          className={`space-y-4 rounded-xl border border-slate-200/70 bg-white p-4 sm:rounded-2xl sm:p-6 ${
            step < 2 ? "opacity-60" : ""
          }`}
        >
          <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Доставка {requiredMark}
          </legend>

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

          <div>
            <label className={labelClass}>Місто {requiredMark}</label>
            <select
              value={selectedCityName}
              onChange={(e) => setSelectedCityName(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Оберіть місто</option>
              {UKRAINIAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Відділення {carrier === "np" ? "Нової Пошти" : "Укрпошти"} {requiredMark}
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
                required={!manualBranch.trim()}
                value={selectedBranch ? (selectedBranch.ref || selectedBranch.id || "") : ""}
                onChange={(e) => {
                  const br = branches.find((b) => (b.ref || b.id) === e.target.value);
                  setSelectedBranch(br ?? null);
                }}
                className={inputClass}
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
                  className={inputClass}
                />
              </div>
            ) : null}
          </div>
          {step === 2 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                ← Назад
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-full border border-lilac px-4 py-2 text-sm text-lilac hover:bg-[var(--lilac-50)]"
              >
                Далі: Оплата →
              </button>
            </div>
          )}
        </fieldset>

        {/* Step 3: Payment */}
        <fieldset
          ref={paymentRef}
          className={`space-y-3 rounded-xl border border-slate-200/70 bg-white p-4 sm:rounded-2xl sm:p-6 ${
            step < 3 ? "opacity-60" : ""
          }`}
        >
          <legend className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Оплата
          </legend>
          <div>
            <label className={labelClass}>Спосіб оплати</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={inputClass}
            >
              <option value="online">Онлайн</option>
              <option value="cod">Накладений платіж</option>
              <option value="bank">Безготівково</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Коментар (необовʼязково)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Коментар до замовлення"
              rows={2}
              className={inputClass}
            />
          </div>
          {step === 3 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              ← Назад
            </button>
          )}
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
          type="submit"
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
