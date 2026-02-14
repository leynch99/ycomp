import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TradeInForm } from "@/components/TradeInForm";

export default function TradeInPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: "Trade-in" }]} />
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Trade-in</h1>
          <p className="mt-3 text-sm text-slate-600">
            Обміняйте стару техніку на вигідні умови. Ми оцінюємо стан і пропонуємо
            знижку на нові комплектуючі.
          </p>
        </div>
        <TradeInForm />
      </div>
    </div>
  );
}
