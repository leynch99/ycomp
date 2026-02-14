"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { formatPrice } from "@/lib/utils";

type CityOption = { id: string; name: string; region: string };
type BranchOption = { id: string; name: string; address: string };

export function CheckoutForm() {
  const { items, total, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [region, setRegion] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [cityOptions, setCityOptions] = useState<CityOption[]>([]);
  const [cityId, setCityId] = useState<string | null>(null);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchId, setBranchId] = useState("");

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSuccess(null);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const selectedBranch = branches.find((b) => b.id === branchId);
    const cityDisplay = region ? `${cityQuery}, ${region}` : cityQuery;
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        city: cityDisplay,
        npBranch: selectedBranch ? `${selectedBranch.name} — ${selectedBranch.address}` : "",
        items,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSuccess(data.number);
      clear();
      event.currentTarget.reset();
      setRegion("");
      setCityQuery("");
      setCityId(null);
      setBranches([]);
      setBranchId("");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/np/regions")
      .then((res) => res.json())
      .then((data: { regions: string[] }) => setRegions(data.regions ?? []))
      .catch(() => null);
  }, []);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!region || cityQuery.trim().length < 3) {
        setCityOptions([]);
        return;
      }
      const res = await fetch(
        `/api/np/cities?region=${encodeURIComponent(region)}&q=${encodeURIComponent(cityQuery)}`,
      );
      if (!res.ok) return;
      const data = (await res.json()) as { cities: CityOption[] };
      setCityOptions(data.cities ?? []);
    }, 250);
    return () => clearTimeout(id);
  }, [cityQuery, region]);

  useEffect(() => {
    if (!cityId) {
      setBranches([]);
      return;
    }
    fetch(`/api/np/branches?cityId=${cityId}`)
      .then((res) => res.json())
      .then((data: { branches: BranchOption[] }) => setBranches(data.branches ?? []))
      .catch(() => null);
  }, [cityId]);

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6">
        <div className="text-sm font-semibold text-slate-900">Контактні дані</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="name"
            required
            placeholder="Імʼя"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="phone"
            required
            placeholder="+380XXXXXXXXX"
            pattern="\\+380\\d{9}"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            name="email"
            required
            type="email"
            placeholder="Email"
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            name="region"
            required
            value={region}
            onChange={(event) => {
              setRegion(event.target.value);
              setCityQuery("");
              setCityId(null);
              setBranchId("");
              setCityOptions([]);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Оберіть область</option>
            {regions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
          <div className="relative">
            <input
              name="city"
              required
              placeholder="Місто / село / смт"
              value={cityQuery}
              onChange={(event) => {
                setCityQuery(event.target.value);
                setCityId(null);
                setBranchId("");
              }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            {cityOptions.length > 0 && (
              <div className="absolute left-0 right-0 top-11 z-10 rounded-2xl border border-slate-200 bg-white p-2 text-xs shadow-lg">
                {cityOptions.map((city) => (
                  <button
                    type="button"
                    key={city.id}
                    onClick={() => {
                      setCityQuery(city.name);
                      setCityId(city.id);
                      setCityOptions([]);
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[var(--lilac-50)]"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <select
            name="npBranch"
            required
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Оберіть відділення НП</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} — {branch.address}
              </option>
            ))}
          </select>
          <select name="paymentMethod" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="online">Онлайн</option>
            <option value="cod">Накладений платіж</option>
            <option value="bank">Безготівково</option>
          </select>
        </div>
        <textarea
          name="comment"
          placeholder="Коментар"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>
      <aside className="space-y-4 rounded-2xl border border-lilac bg-white p-6 shadow-sm lg:sticky lg:top-32">
        <div className="text-sm font-semibold text-slate-900">Ваше замовлення</div>
        <div className="space-y-2 text-sm text-slate-600">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.name} × {item.qty}
              </span>
              <span>{formatPrice(item.salePrice * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm font-semibold">
          <span>Разом</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="rounded-xl bg-[var(--lilac-50)] px-3 py-2 text-xs text-slate-600">
          Підтвердження менеджером протягом 15 хвилин
        </div>
        <button
          disabled={loading || items.length === 0}
          className="w-full rounded-full bg-lilac px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Оформлюємо..." : "Підтвердити замовлення"}
        </button>
        {success && (
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Замовлення №{success} створено. Менеджер звʼяжеться з вами.
          </div>
        )}
      </aside>
    </form>
  );
}
