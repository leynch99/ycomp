"use client";

import Link from "next/link";
import { useCompare } from "@/components/providers/CompareProvider";
import { formatPrice } from "@/lib/utils";

const FIELDS = [
  { key: "brand", label: "Бренд" },
  { key: "salePrice", label: "Ціна" },
  { key: "socket", label: "Socket" },
  { key: "cores", label: "Cores" },
  { key: "threads", label: "Threads" },
  { key: "chipset", label: "Chipset" },
  { key: "formFactor", label: "Form factor" },
  { key: "ramType", label: "RAM type" },
  { key: "ramCapacity", label: "RAM capacity" },
  { key: "ramFrequency", label: "RAM frequency" },
  { key: "storageType", label: "Storage type" },
  { key: "storageCapacity", label: "Storage capacity" },
  { key: "psuWattage", label: "PSU wattage" },
  { key: "psuCert", label: "PSU cert" },
];

export function ComparePageClient() {
  const { items, toggle } = useCompare();

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm">
        Список порожній. <Link href="/catalog">Перейти до каталогу</Link>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-2xl border border-slate-200/70 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--lilac-50)] text-left">
            <th className="p-4 text-xs uppercase tracking-wide text-slate-400">Характеристика</th>
            {items.map((item) => (
              <th key={item.id} className="p-4">
                <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                <div className="mt-2 text-xs text-slate-500">{formatPrice(item.salePrice)}</div>
                <button
                  onClick={() => toggle(item)}
                  className="mt-2 rounded-full border border-lilac px-3 py-1 text-xs text-slate-600"
                >
                  Видалити
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FIELDS.map((field, index) => (
            <tr key={field.key} className={`border-t ${index % 2 ? "bg-white" : "bg-slate-50/40"}`}>
              <td className="p-4 text-slate-500">{field.label}</td>
              {items.map((item) => (
                <td key={`${item.id}-${field.key}`} className="p-4 text-slate-700">
                  {field.key === "salePrice"
                    ? formatPrice(item.salePrice)
                    : (item as any)[field.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
