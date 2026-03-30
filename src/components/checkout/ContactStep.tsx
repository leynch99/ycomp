import React from "react";

export type ContactStepProps = {
  step: number;
  contactsRef: React.RefObject<HTMLFieldSetElement | null>;
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  goNext: () => void;
  inputClass: string;
  labelClass: string;
  requiredMark: React.ReactNode;
  formatPhone: (v: string) => string;
};

export function ContactStep({
  step,
  contactsRef,
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  goNext,
  inputClass,
  labelClass,
  requiredMark,
  formatPhone,
}: ContactStepProps) {
  return (
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
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ваше імʼя"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Телефон {requiredMark}</label>
          <input
            value={phone || ""}
            onChange={(e) => {
              let v = e.target.value;
              const d = v.replace(/\D/g, "");
              if (!d) {
                setPhone("");
                return;
              }
              if (d.startsWith("8") || d.startsWith("0")) {
                v = "+380" + d.replace(/^(80|8|0)/, "").slice(0, 9);
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
            value={email || ""}
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
  );
}
