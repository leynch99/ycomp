import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/utils";

export default async function Home() {
  const [hits, deals, categories] = await Promise.all([
    prisma.product.findMany({
      take: 8,
      orderBy: { popularity: "desc" },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.product.findMany({
      where: { isDeal: true },
      take: 6,
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      take: 8,
    }),
  ]);

  const kits = [
    { title: "CPU + MB + RAM", price: 12999 },
    { title: "Upgrade SSD + RAM", price: 3999 },
    { title: "Silent PC", price: 28999 },
    { title: "Streaming Kit", price: 21999 },
  ];

  const advantages = [
    { title: "Гарантія та повернення", text: "Офіційна гарантія та 14 днів на повернення." },
    { title: "Перевірка сумісності", text: "Контролюємо сумісність у конфігураторі." },
    { title: "Швидка підтримка", text: "Консультації по телефону та в чаті." },
  ];

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[var(--lilac-50)] to-white py-10">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--lilac-100)] blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[var(--lilac-100)] blur-3xl" />
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 rounded-3xl border border-lilac bg-gradient-to-br from-[var(--lilac-50)] via-white to-[var(--lilac-100)] p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">ycomp.ua</div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 lg:text-5xl">
              Інтернет-магазин компʼютерних комплектуючих
            </h1>
            <p className="text-base text-slate-600">
              Швидкий підбір, перевірка сумісності, доставка Новою Поштою та сервіс.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/configurator"
                className="rounded-full bg-lilac px-6 py-3 text-sm text-white transition hover:opacity-90"
              >
                Зібрати ПК
              </Link>
              <Link
                href="/catalog"
                className="rounded-full border border-lilac px-6 py-3 text-sm text-slate-700 transition hover:border-[var(--lilac-500)] hover:text-[var(--lilac-900)]"
              >
                Підібрати апгрейд
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: "50k+", label: "товарів" },
                { value: "1–3", label: "дні доставки" },
                { value: "14 днів", label: "на повернення" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                  <div className="text-lg font-semibold text-slate-900">{item.value}</div>
                  <div className="text-xs text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-lilac">
            <div className="text-sm font-medium text-slate-700">Пошук комплектуючих</div>
            <div className="mt-4 rounded-2xl border border-lilac bg-white p-5">
              <div className="text-xs uppercase text-slate-400">Популярні запити</div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {["RTX 4070", "Ryzen 7", "DDR5 32GB", "NVMe 1TB"].map((q) => (
                  <Link
                    key={q}
                    href={`/catalog?q=${encodeURIComponent(q)}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-slate-600 transition hover:border-[var(--lilac-500)] hover:text-[var(--lilac-900)]"
                  >
                    {q}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm">
              <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-slate-700">
                Підбір апгрейду за 10 хвилин
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-slate-700">
                Trade-in і сервіс
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="bg-white py-4">
        <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Хіти продажу</h2>
          <Link href="/catalog" className="text-sm text-slate-500">
            Дивитися всі
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hits.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                brand: product.brand,
                salePrice: product.salePrice,
                oldPrice: product.oldPrice,
                stockQty: product.stockQty,
                inStock: product.inStock,
                leadTimeMinDays: product.leadTimeMinDays,
                leadTimeMaxDays: product.leadTimeMaxDays,
                image: product.images[0]?.url,
                isDeal: product.isDeal,
                isOutlet: product.isOutlet,
              }}
            />
          ))}
        </div>
        </div>
      </section>

      <section className="bg-[var(--lilac-50)] py-10">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Популярні категорії</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/c/${cat.slug}`}
                className="rounded-2xl border border-slate-200/70 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="text-xs uppercase text-slate-400">Категорія</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{cat.name}</div>
                <div className="mt-4 text-xs text-slate-500">Дивитися товари →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Акції</h2>
            <Link href="/deals" className="text-sm text-slate-500">
              Всі акції
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  sku: product.sku,
                  brand: product.brand,
                  salePrice: product.salePrice,
                  oldPrice: product.oldPrice,
                  stockQty: product.stockQty,
                  inStock: product.inStock,
                  leadTimeMinDays: product.leadTimeMinDays,
                  leadTimeMaxDays: product.leadTimeMaxDays,
                  image: product.images[0]?.url,
                  isDeal: product.isDeal,
                  isOutlet: product.isOutlet,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Готові комплекти</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kits.map((kit) => (
            <div key={kit.title} className="rounded-2xl border bg-white p-6">
              <div className="text-sm text-slate-500">Набір</div>
              <div className="mt-2 text-lg font-semibold">{kit.title}</div>
              <div className="mt-4 text-sm text-slate-600">
                від {formatPrice(kit.price)}
              </div>
              <Link
                href="/configurator"
                className="mt-4 inline-flex rounded-full border px-4 py-2 text-xs"
              >
                Зібрати
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Переваги</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {advantages.map((adv) => (
            <div key={adv.title} className="rounded-2xl border bg-white p-6">
              <div className="text-lg font-semibold">{adv.title}</div>
              <p className="mt-2 text-sm text-slate-600">{adv.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/trade-in" className="rounded-2xl border bg-white p-6">
            <div className="text-sm text-slate-500">Trade-in</div>
            <div className="mt-2 text-lg font-semibold">Обміняйте старе на нове</div>
            <p className="mt-2 text-sm text-slate-600">
              Отримайте вигідну пропозицію за вашу техніку.
            </p>
          </Link>
          <Link href="/service" className="rounded-2xl border bg-white p-6">
            <div className="text-sm text-slate-500">Сервіс</div>
            <div className="mt-2 text-lg font-semibold">Діагностика та збірка</div>
            <p className="mt-2 text-sm text-slate-600">
              Збірка, чистка та налаштування ПК під ключ.
            </p>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="rounded-3xl border border-lilac bg-gradient-to-br from-[var(--lilac-900)] to-[var(--lilac-700)] p-8 text-white">
          <div className="text-sm text-slate-300">Блог / гайди</div>
          <div className="mt-3 text-2xl font-semibold">
            Скоро додамо огляди, гайди та збірки
          </div>
        </div>
      </section>
    </div>
  );
}
