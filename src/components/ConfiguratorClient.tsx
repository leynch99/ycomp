"use client";

import { useMemo, useState } from "react";
import { ProductListItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/providers/CartProvider";

type ConfiguratorProps = {
  cpu: ProductListItem[];
  motherboard: ProductListItem[];
  ram: ProductListItem[];
  gpu: ProductListItem[];
  ssd: ProductListItem[];
  psu: ProductListItem[];
  cases: ProductListItem[];
};

export function ConfiguratorClient(props: ConfiguratorProps) {
  const [cpu, setCpu] = useState<ProductListItem | null>(null);
  const [mb, setMb] = useState<ProductListItem | null>(null);
  const [ram, setRam] = useState<ProductListItem | null>(null);
  const [gpu, setGpu] = useState<ProductListItem | null>(null);
  const [ssd, setSsd] = useState<ProductListItem | null>(null);
  const [psu, setPsu] = useState<ProductListItem | null>(null);
  const [pcCase, setCase] = useState<ProductListItem | null>(null);
  const { addItem } = useCart();

  const filteredMb = useMemo(() => {
    if (!cpu?.socket) return props.motherboard;
    return props.motherboard.filter((m) => m.socket === cpu.socket);
  }, [cpu, props.motherboard]);

  const filteredRam = useMemo(() => {
    if (!mb?.ramType) return props.ram;
    return props.ram.filter((r) => r.ramType === mb.ramType);
  }, [mb, props.ram]);

  const recommendedPower = useMemo(() => {
    const cpuPower = cpu?.powerW ?? 65;
    const gpuPower = gpu?.powerW ?? 150;
    return cpuPower + gpuPower + 150;
  }, [cpu, gpu]);

  const filteredPsu = useMemo(() => {
    return props.psu.filter((p) => (p.psuWattage ?? 0) >= recommendedPower);
  }, [props.psu, recommendedPower]);

  const total =
    (cpu?.salePrice ?? 0) +
    (mb?.salePrice ?? 0) +
    (ram?.salePrice ?? 0) +
    (gpu?.salePrice ?? 0) +
    (ssd?.salePrice ?? 0) +
    (psu?.salePrice ?? 0) +
    (pcCase?.salePrice ?? 0);

  const addAll = () => {
    [cpu, mb, ram, gpu, ssd, psu, pcCase].forEach((item) => {
      if (item) addItem(item, 1);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Step title="CPU" items={props.cpu} value={cpu} onSelect={setCpu} />
        <Step title="Motherboard" items={filteredMb} value={mb} onSelect={setMb} />
        <Step title="RAM" items={filteredRam} value={ram} onSelect={setRam} />
        <Step title="GPU" items={props.gpu} value={gpu} onSelect={setGpu} />
        <Step title="SSD" items={props.ssd} value={ssd} onSelect={setSsd} />
        <Step
          title={`PSU (рекомендовано ${recommendedPower}W+)`}
          items={filteredPsu}
          value={psu}
          onSelect={setPsu}
        />
        <Step title="Case" items={props.cases} value={pcCase} onSelect={setCase} />
      </div>
      <aside className="h-fit rounded-2xl border bg-white p-6">
        <div className="text-sm font-semibold">Ваша збірка</div>
        <div className="mt-3 space-y-2 text-sm text-slate-600">
          {[
            cpu,
            mb,
            ram,
            gpu,
            ssd,
            psu,
            pcCase,
          ].map((item, idx) => (
            <div key={idx}>{item ? item.name : "—"}</div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>Разом</span>
          <span className="font-semibold">{formatPrice(total)}</span>
        </div>
        <button
          className="mt-4 w-full rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
          onClick={addAll}
        >
          Додати все в кошик
        </button>
        <div className="mt-6 rounded-xl border bg-slate-50 p-4 text-xs text-slate-600">
          Потрібна консультація? Залиште заявку на сторінці контакту.
        </div>
      </aside>
    </div>
  );
}

function Step({
  title,
  items,
  value,
  onSelect,
}: {
  title: string;
  items: ProductListItem[];
  value: ProductListItem | null;
  onSelect: (item: ProductListItem | null) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{title}</div>
        {value && (
          <button onClick={() => onSelect(null)} className="text-xs text-slate-500">
            Очистити
          </button>
        )}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.slice(0, 6).map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className={`rounded-xl border px-3 py-2 text-left text-xs ${
              value?.id === item.id ? "border-slate-900" : ""
            }`}
          >
            <div className="font-semibold">{item.name}</div>
            <div className="text-slate-500">{formatPrice(item.salePrice)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
