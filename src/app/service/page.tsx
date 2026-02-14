import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ServiceForm } from "@/components/ServiceForm";

export default function ServicePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
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
