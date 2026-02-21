import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceForm } from "@/components/ServiceForm";
import { buildFaqSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Сервіс",
  description: "Діагностика, чистка, збірка та налаштування компʼютерів. YComp сервіс — швидко та акуратно.",
};

const SERVICE_FAQ = [
  { question: "Які послуги надає YComp сервіс?", answer: "Діагностика, чистка, збірка та налаштування компʼютерів. Працюємо швидко та акуратно." },
  { question: "Скільки коштує діагностика?", answer: "Вартість залежить від типу обладнання. Залиште заявку — менеджер розрахує та запропонує варіанти." },
  { question: "Чи можна залишити техніку на сервіс?", answer: "Так, після оформлення заявки ми узгоджуємо час передачі техніки та терміни виконання." },
];

export default function ServicePage() {
  const faqSchema = buildFaqSchema(SERVICE_FAQ);
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: "Сервіс" }]} />
      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Сервіс</h1>
          <p className="mt-3 text-sm text-slate-600">
            Діагностика, чистка, збірка та налаштування. Працюємо швидко та акуратно.
          </p>
          <div className="mt-6 grid gap-3 text-sm">
            {["Діагностика", "Чистка", "Збірка", "Налаштування"].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200/70 bg-white p-4">
                {item}
              </div>
            ))}
          </div>
        </div>
        <ServiceForm />
      </div>
    </div>
  );
}
