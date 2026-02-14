"use client";

import { useRouter, useSearchParams } from "next/navigation";

type FilterOption = {
  label: string;
  value: string;
};

export function CatalogFilters({
  brands,
  sockets,
  cores,
  threads,
  chipsets,
  formFactors,
  ramTypes,
  ramCapacities,
  ramFrequencies,
  storageTypes,
  storageCapacities,
  psuWattages,
  psuCerts,
}: {
  brands: FilterOption[];
  sockets: FilterOption[];
  cores: FilterOption[];
  threads: FilterOption[];
  chipsets: FilterOption[];
  formFactors: FilterOption[];
  ramTypes: FilterOption[];
  ramCapacities: FilterOption[];
  ramFrequencies: FilterOption[];
  storageTypes: FilterOption[];
  storageCapacities: FilterOption[];
  psuWattages: FilterOption[];
  psuCerts: FilterOption[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const existing = params.get(key)?.split(",").filter(Boolean) ?? [];
    if (existing.includes(value)) {
      const next = existing.filter((v) => v !== value);
      if (next.length) params.set(key, next.join(","));
      else params.delete(key);
    } else {
      params.set(key, [...existing, value].join(","));
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const toggleBoolean = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key);
    if (current === "true") params.delete(key);
    else params.set(key, "true");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const setRange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6 text-sm">
      <div>
        <div className="font-semibold text-slate-900">Ціна</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            placeholder="від"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[var(--lilac-500)] focus:outline-none"
            defaultValue={searchParams.get("minPrice") ?? ""}
            onBlur={(event) => setRange("minPrice", event.target.value)}
          />
          <input
            placeholder="до"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-[var(--lilac-500)] focus:outline-none"
            defaultValue={searchParams.get("maxPrice") ?? ""}
            onBlur={(event) => setRange("maxPrice", event.target.value)}
          />
        </div>
      </div>
      <div>
        <div className="font-semibold text-slate-900">Наявність</div>
        <label
          className={`mt-3 flex items-center gap-2 rounded-lg border px-2 py-1 text-xs ${
            searchParams.get("inStock") === "true"
              ? "border-lilac bg-[var(--lilac-50)] text-[var(--lilac-900)]"
              : "border-slate-200 text-slate-600"
          }`}
        >
          <input
            type="checkbox"
            checked={searchParams.get("inStock") === "true"}
            onChange={() => toggleBoolean("inStock")}
          />
          В наявності
        </label>
        <label
          className={`mt-2 flex items-center gap-2 rounded-lg border px-2 py-1 text-xs ${
            searchParams.get("lead") === "1-3"
              ? "border-lilac bg-[var(--lilac-50)] text-[var(--lilac-900)]"
              : "border-slate-200 text-slate-600"
          }`}
        >
          <input
            type="checkbox"
            checked={searchParams.get("lead") === "1-3"}
            onChange={() => toggle("lead", "1-3")}
          />
          Під замовлення 1–3 дні
        </label>
        <label
          className={`mt-2 flex items-center gap-2 rounded-lg border px-2 py-1 text-xs ${
            searchParams.get("lead") === "3-7"
              ? "border-lilac bg-[var(--lilac-50)] text-[var(--lilac-900)]"
              : "border-slate-200 text-slate-600"
          }`}
        >
          <input
            type="checkbox"
            checked={searchParams.get("lead") === "3-7"}
            onChange={() => toggle("lead", "3-7")}
          />
          Під замовлення 3–7 днів
        </label>
      </div>
      <FilterGroup title="Бренд" options={brands} paramKey="brand" onToggle={toggle} />
      {sockets.length > 0 && (
        <FilterGroup title="Socket" options={sockets} paramKey="socket" onToggle={toggle} />
      )}
      {cores.length > 0 && (
        <FilterGroup title="Cores" options={cores} paramKey="cores" onToggle={toggle} />
      )}
      {threads.length > 0 && (
        <FilterGroup title="Threads" options={threads} paramKey="threads" onToggle={toggle} />
      )}
      {chipsets.length > 0 && (
        <FilterGroup title="Chipset" options={chipsets} paramKey="chipset" onToggle={toggle} />
      )}
      {formFactors.length > 0 && (
        <FilterGroup
          title="Form factor"
          options={formFactors}
          paramKey="formFactor"
          onToggle={toggle}
        />
      )}
      {ramTypes.length > 0 && (
        <FilterGroup title="RAM type" options={ramTypes} paramKey="ramType" onToggle={toggle} />
      )}
      {ramCapacities.length > 0 && (
        <FilterGroup
          title="RAM capacity"
          options={ramCapacities}
          paramKey="ramCapacity"
          onToggle={toggle}
        />
      )}
      {ramFrequencies.length > 0 && (
        <FilterGroup
          title="RAM frequency"
          options={ramFrequencies}
          paramKey="ramFrequency"
          onToggle={toggle}
        />
      )}
      {storageTypes.length > 0 && (
        <FilterGroup
          title="Storage"
          options={storageTypes}
          paramKey="storageType"
          onToggle={toggle}
        />
      )}
      {storageCapacities.length > 0 && (
        <FilterGroup
          title="Storage capacity"
          options={storageCapacities}
          paramKey="storageCapacity"
          onToggle={toggle}
        />
      )}
      {psuWattages.length > 0 && (
        <FilterGroup
          title="PSU wattage"
          options={psuWattages}
          paramKey="psuWattage"
          onToggle={toggle}
        />
      )}
      {psuCerts.length > 0 && (
        <FilterGroup title="PSU cert" options={psuCerts} paramKey="psuCert" onToggle={toggle} />
      )}
    </div>
  );
}

function FilterGroup({
  title,
  options,
  paramKey,
  onToggle,
}: {
  title: string;
  options: FilterOption[];
  paramKey: string;
  onToggle: (key: string, value: string) => void;
}) {
  if (options.length === 0) return null;
  const searchParams = useSearchParams();
  const selected = searchParams.get(paramKey)?.split(",").filter(Boolean) ?? [];

  return (
    <div>
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="mt-3 space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center gap-2 rounded-lg border px-2 py-1 text-xs ${
              selected.includes(option.value)
                ? "border-lilac bg-[var(--lilac-50)] text-[var(--lilac-900)]"
                : "border-slate-200 text-slate-600"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(paramKey, option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
