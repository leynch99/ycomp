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
    <div className="space-y-12 sm:space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-[var(--lilac-50)] to-white py-6 sm:py-10">
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--lilac-100)] blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[var(--lilac-100)] blur-3xl" />
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 rounded-2xl border border-lilac bg-gradient-to-br from-[var(--lilac-50)] via-white to-[var(--lilac-100)] p-5 shadow-sm sm:gap-8 sm:rounded-3xl sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4 sm:space-y-6">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs">ycomp.ua</div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Інтернет-магазин компʼютерних комплектуючих
              </h1>
              <p className="text-sm text-slate-600 sm:text-base">
                Швидкий підбір, перевірка сумісності, доставка Новою Поштою та сервіс.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/configurator"
                  className="rounded-full bg-lilac px-5 py-2.5 text-center text-sm text-white transition hover:opacity-90 sm:px-6 sm:py-3"
                >
                  Зібрати ПК
                </Link>
                <Link
                  href="/catalog"
                  className="rounded-full border border-lilac px-5 py-2.5 text-center text-sm text-slate-700 transition hover:border-[var(--lilac-500)] hover:text-[var(--lilac-900)] sm:px-6 sm:py-3"
                >
                  Підібрати апгрейд
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {[
                  { value: "50k+", label: "товарів" },
                  { value: "1–3", label: "дні доставки" },
                  { value: "14 днів", label: "на повернення" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 sm:rounded-2xl sm:px-4 sm:py-3">
                    <div className="text-sm font-semibold text-slate-900 sm:text-lg">{item.value}</div>
                    <div className="text-[10px] text-slate-500 sm:text-xs">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-lilac sm:block">
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

      {/* Bestsellers */}
      <section className="bg-white py-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Хіти продажу</h2>
            <Link href="/catalog" className="text-xs text-slate-500 sm:text-sm">
              Дивитися всі
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
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

      {/* Popular categories */}
      <section className="bg-[var(--lilac-50)] py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Популярні категорії</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/c/${cat.slug}`}
                className="rounded-xl border border-slate-200/70 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-6"
              >
                <div className="text-[10px] uppercase text-slate-400 sm:text-xs">Категорія</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 sm:mt-2 sm:text-lg">{cat.name}</div>
                <div className="mt-2 text-[10px] text-slate-500 sm:mt-4 sm:text-xs">Дивитися товари →</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deals */}
      <section className="bg-white py-4 sm:py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Акції</h2>
            <Link href="/deals" className="text-xs text-slate-500 sm:text-sm">
              Всі акції
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-3">
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

      {/* Kits */}
      <section className="mx-auto max-w-7xl px-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Готові комплекти</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
          {kits.map((kit) => (
            <div key={kit.title} className="rounded-xl border bg-white p-4 sm:rounded-2xl sm:p-6">
              <div className="text-[10px] text-slate-500 sm:text-sm">Набір</div>
              <div className="mt-1 text-sm font-semibold sm:mt-2 sm:text-lg">{kit.title}</div>
              <div className="mt-2 text-xs text-slate-600 sm:mt-4 sm:text-sm">
                від {formatPrice(kit.price)}
              </div>
              <Link
                href="/configurator"
                className="mt-3 inline-flex rounded-full border px-3 py-1.5 text-[10px] sm:mt-4 sm:px-4 sm:py-2 sm:text-xs"
              >
                Зібрати
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section className="mx-auto max-w-7xl px-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Переваги</h2>
        <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {advantages.map((adv) => (
            <div key={adv.title} className="rounded-xl border bg-white p-4 sm:rounded-2xl sm:p-6">
              <div className="text-sm font-semibold sm:text-lg">{adv.title}</div>
              <p className="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">{adv.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trade-in / Service */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <Link href="/trade-in" className="rounded-xl border bg-white p-4 sm:rounded-2xl sm:p-6">
            <div className="text-[10px] text-slate-500 sm:text-sm">Trade-in</div>
            <div className="mt-1 text-sm font-semibold sm:mt-2 sm:text-lg">Обміняйте старе на нове</div>
            <p className="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
              Отримайте вигідну пропозицію за вашу техніку.
            </p>
          </Link>
          <Link href="/service" className="rounded-xl border bg-white p-4 sm:rounded-2xl sm:p-6">
            <div className="text-[10px] text-slate-500 sm:text-sm">Сервіс</div>
            <div className="mt-1 text-sm font-semibold sm:mt-2 sm:text-lg">Діагностика та збірка</div>
            <p className="mt-1 text-xs text-slate-600 sm:mt-2 sm:text-sm">
              Збірка, чистка та налаштування ПК під ключ.
            </p>
          </Link>
        </div>
      </section>

      {/* Blog */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:pb-16">
        <div className="rounded-2xl border border-lilac bg-gradient-to-br from-[var(--lilac-900)] to-[var(--lilac-700)] p-6 text-white sm:rounded-3xl sm:p-8">
          <div className="text-xs text-slate-300 sm:text-sm">Блог / гайди</div>
          <div className="mt-2 text-lg font-semibold sm:mt-3 sm:text-2xl">
            Скоро додамо огляди, гайди та збірки
          </div>
        </div>
      </section>
    </div>
  );
}
