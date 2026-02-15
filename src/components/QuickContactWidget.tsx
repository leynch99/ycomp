"use client";

import { useEffect, useState } from "react";

export function QuickContactWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState("");

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("quick-contact:open", handler);
    return () => window.removeEventListener("quick-contact:open", handler);
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const rawPhone = String(payload.phone ?? "").trim();
    const normalized = normalizePhone(rawPhone);
    const phoneOk = normalized !== null;
    if (!phoneOk) {
      setStatus("Невірний формат телефону. Приклад: +380XXXXXXXXX");
      return;
    }
    const res = await fetch("/api/quick-contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, phone: normalized }),
    });
    setStatus(res.ok ? "Запит надіслано" : "Помилка");
    if (res.ok) {
      event.currentTarget.reset();
      setPhoneValue("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-80 rounded-2xl border border-lilac bg-white p-4 shadow-lg sm:w-80">
          <div className="text-sm font-semibold text-slate-900">Швидкий звʼязок</div>
          <form onSubmit={submit} className="mt-3 space-y-2">
            <input
              name="phone"
              required
              type="tel"
              inputMode="tel"
              placeholder="+380XXXXXXXXX"
              value={phoneValue}
              onChange={(event) => setPhoneValue(maskPhone(event.target.value))}
              className="w-full rounded-lg border px-3 py-2 text-xs"
            />
            <textarea
              name="question"
              required
              placeholder="Ваше питання"
              className="w-full rounded-lg border px-3 py-2 text-xs"
            />
            <button className="w-full rounded-full bg-lilac px-3 py-2 text-xs text-white">
              Надіслати
            </button>
            {status && <div className="text-[11px] text-slate-500">{status}</div>}
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-lilac px-4 py-2 text-xs text-white shadow-lg"
      >
        {open ? "Закрити" : "Швидкий звʼязок"}
      </button>
    </div>
  );
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("380")) {
    return `+${digits.slice(0, 12)}`;
  }
  if (digits.startsWith("0")) {
    return digits.slice(0, 10);
  }
  if (digits.length > 0) {
    return `+380${digits.slice(0, 9)}`;
  }
  return "";
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("380") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `+38${digits}`;
  }
  return null;
}
