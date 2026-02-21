import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TradeInForm } from "@/components/TradeInForm";
import { buildFaqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Trade-in",
  description: "Обміняйте стару техніку на вигідні умови. YComp оцінює стан і пропонує знижку на нові комплектуючі.",
};

const TRADEIN_FAQ = [
  { question: "Що таке trade-in в YComp?", answer: "Обмін старої техніки на знижку при купівлі нових комплектуючих. Ми оцінюємо стан і пропонуємо вигідні умови." },
  { question: "Яку техніку можна здати на trade-in?", answer: "Процесори, відеокарти, материнські плати, RAM, SSD та інші комплектуючі. Оцінка залежить від моделі та стану." },
  { question: "Як отримати оцінку для trade-in?", answer: "Заповніть форму на сторінці — вкажіть модель, стан, вік. Менеджер звʼяжеться з попередньою оцінкою." },
];

export default function TradeInPage() {
  const faqSchema = buildFaqSchema(TRADEIN_FAQ);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
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
