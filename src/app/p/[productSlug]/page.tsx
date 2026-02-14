import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: { productSlug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.productSlug },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      supplier: true,
    },
  });
  if (!product) return notFound();

  const similar = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const upsell = await prisma.product.findMany({
    where: { category: { slug: "accessories" } },
    take: 4,
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const images = product.images.length ? product.images : [{ url: "/images/placeholder.svg" }];
  const mainImage = images[0];
  const thumbs = images.slice(1, 4);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      priceCurrency: "UAH",
      price: product.salePrice,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: `/p/${product.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs
        items={[
          { title: "Головна", href: "/" },
          { title: product.category.name, href: `/c/${product.category.slug}` },
          { title: product.name },
        ]}
      />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-lilac bg-gradient-to-br from-[var(--lilac-50)] via-white to-[var(--lilac-100)] shadow-sm">
            <Image src={mainImage.url} alt={product.name} fill className="object-contain p-10" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {thumbs.map((img, index) => (
              <div
                key={`${img.url}-${index}`}
                className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200/70 bg-white hover:border-[var(--lilac-500)]"
              >
                <Image src={img.url} alt={product.name} fill className="object-contain p-4" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{product.brand}</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
              {product.name}
            </h1>
            <div className="mt-2 text-xs text-slate-500">SKU: {product.sku}</div>
          </div>
          <div className="rounded-2xl border border-lilac bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-semibold text-slate-900">
                {formatPrice(product.salePrice)}
              </div>
              {product.oldPrice && (
                <div className="text-sm text-slate-400 line-through">
                  {formatPrice(product.oldPrice)}
                </div>
              )}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {product.inStock
                ? "В наявності"
                : `Під замовлення ${product.leadTimeMinDays ?? 3}-${product.leadTimeMaxDays ?? 7} днів`}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/cart?add=${product.id}`}
                className="rounded-full bg-lilac px-5 py-2 text-sm text-white transition hover:opacity-90"
              >
                В кошик
              </Link>
              <button className="rounded-full border border-lilac px-5 py-2 text-sm text-slate-700 transition hover:text-[var(--lilac-900)]">
                Купити в 1 клік
              </button>
            </div>
            <div className="mt-4 grid gap-2 rounded-xl bg-[var(--lilac-50)] px-3 py-2 text-xs text-slate-600">
              <div>Гарантія та повернення 14 днів</div>
              <div>Доставка: Нова Пошта, 1–3 дні</div>
              <div>Оплата: онлайн/наложка/безнал</div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Сумісність", text: "Перевіримо під вашу збірку" },
              { title: "Підтримка", text: "Консультація перед покупкою" },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-200/70 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                <div className="mt-2 text-xs text-slate-600">{item.text}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6">
            <div className="text-sm font-semibold text-slate-900">Характеристики</div>
            <table className="mt-3 w-full text-xs text-slate-600">
              <tbody>
                <SpecRow label="Socket" value={product.socket} />
                <SpecRow label="Cores" value={product.cores?.toString()} />
                <SpecRow label="Threads" value={product.threads?.toString()} />
                <SpecRow label="Chipset" value={product.chipset} />
                <SpecRow label="Form factor" value={product.formFactor} />
                <SpecRow label="RAM type" value={product.ramType} />
                <SpecRow label="RAM capacity" value={product.ramCapacity?.toString()} />
                <SpecRow label="RAM frequency" value={product.ramFrequency?.toString()} />
                <SpecRow label="Storage type" value={product.storageType} />
                <SpecRow label="Storage capacity" value={product.storageCapacity?.toString()} />
                <SpecRow label="PSU wattage" value={product.psuWattage?.toString()} />
                <SpecRow label="PSU cert" value={product.psuCert} />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">З цим купують</h2>
          <Link href="/catalog" className="text-xs text-slate-500">
            Дивитися всі
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {upsell.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.id,
                name: item.name,
                slug: item.slug,
                sku: item.sku,
                brand: item.brand,
                salePrice: item.salePrice,
                oldPrice: item.oldPrice,
                stockQty: item.stockQty,
                inStock: item.inStock,
                leadTimeMinDays: item.leadTimeMinDays,
                leadTimeMaxDays: item.leadTimeMaxDays,
                image: item.images[0]?.url,
                isDeal: item.isDeal,
                isOutlet: item.isOutlet,
              }}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Схожі товари</h2>
          <Link href="/catalog" className="text-xs text-slate-500">
            Дивитися всі
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.id,
                name: item.name,
                slug: item.slug,
                sku: item.sku,
                brand: item.brand,
                salePrice: item.salePrice,
                oldPrice: item.oldPrice,
                stockQty: item.stockQty,
                inStock: item.inStock,
                leadTimeMinDays: item.leadTimeMinDays,
                leadTimeMaxDays: item.leadTimeMaxDays,
                image: item.images[0]?.url,
                isDeal: item.isDeal,
                isOutlet: item.isOutlet,
              }}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900">Відгуки</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm text-slate-600">
            Скоро тут зʼявляться відгуки покупців.
          </div>
          <div className="rounded-2xl border border-lilac bg-white p-6 text-sm">
            <div className="text-sm font-semibold text-slate-900">Залишити відгук</div>
            <div className="mt-2 text-xs text-slate-500">
              Авторизація потрібна у фінальній версії.
            </div>
            <button className="mt-4 rounded-full bg-lilac px-4 py-2 text-xs text-white">
              Написати відгук
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <tr className="border-b border-slate-100 last:border-none">
      <td className="py-2 font-medium text-slate-700">{label}</td>
      <td className="py-2 text-right text-slate-600">{value}</td>
    </tr>
  );
}
