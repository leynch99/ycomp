import React from "react";
import { UKRAINIAN_CITIES } from "@/lib/ukrainian-cities";

export type Carrier = "np" | "up";
export type BranchOption = { ref?: string; id?: string; name: string; address?: string };

export type DeliveryStepProps = {
  step: number;
  deliveryRef: React.RefObject<HTMLFieldSetElement | null>;
  carrier: Carrier;
  switchCarrier: (c: Carrier) => void;
  selectedCityName: string;
  setSelectedCityName: (v: string) => void;
  branchesLoading: boolean;
  branches: BranchOption[];
  selectedBranch: BranchOption | null;
  setSelectedBranch: (b: BranchOption | null) => void;
  branchFallback: string | null;
  manualBranch: string;
  setManualBranch: (v: string) => void;
  goBack: () => void;
  goNext: () => void;
  inputClass: string;
  labelClass: string;
  requiredMark: React.ReactNode;
};

export function DeliveryStep({
  step,
  deliveryRef,
  carrier,
  switchCarrier,
  selectedCityName,
  setSelectedCityName,
  branchesLoading,
  branches,
  selectedBranch,
  setSelectedBranch,
  branchFallback,
  manualBranch,
  setManualBranch,
  goBack,
  goNext,
  inputClass,
  labelClass,
  requiredMark,
}: DeliveryStepProps) {
  return (
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
          value={selectedCityName || ""}
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
            required={!(manualBranch || "").trim()}
            value={selectedBranch ? (selectedBranch.ref || selectedBranch.id || selectedBranch.name || "") : ""}
            onChange={(e) => {
              const br = branches.find((b) => (b.ref || b.id || b.name) === e.target.value);
              setSelectedBranch(br ?? null);
            }}
            className={inputClass}
          >
            <option value="">Оберіть відділення</option>
            {branches.map((br) => (
              <option key={br.ref || br.id || br.name} value={br.ref || br.id || br.name}>
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
              value={manualBranch || ""}
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
  );
}
