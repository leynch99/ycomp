import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/seo";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ productSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productSlug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });
  if (!product) return {};
  const image = product.images[0]?.url ?? "/images/placeholder.svg";
  const desc = product.description.slice(0, 160).replace(/\s+/g, " ").trim();
  return {
    title: `${product.name} — ${product.brand}`,
    description: desc,
    openGraph: {
      title: `${product.name} | YComp`,
      description: desc,
      url: `/p/${product.slug}`,
      images: [{ url: image.startsWith("http") ? image : absoluteUrl(image), alt: product.name }],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { productSlug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
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

  const productUrl = absoluteUrl(`/p/${product.slug}`);
  const imageUrl = mainImage.url.startsWith("http") ? mainImage.url : absoluteUrl(mainImage.url);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.description.slice(0, 500),
    brand: { "@type": "Brand", name: product.brand },
    image: imageUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "UAH",
      price: product.salePrice,
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: productUrl,
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: product.category.name, item: absoluteUrl(`/c/${product.category.slug}`) },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <Breadcrumbs
        items={[
          { title: "Головна", href: "/" },
          { title: product.category.name, href: `/c/${product.category.slug}` },
          { title: product.name },
        ]}
      />
      <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <div className="mt-4 grid gap-5 sm:mt-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-lilac bg-gradient-to-br from-[var(--lilac-50)] via-white to-[var(--lilac-100)] shadow-sm sm:rounded-3xl">
            <Image src={mainImage.url} alt={product.name} fill className="object-contain p-6 sm:p-10" />
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {thumbs.map((img, index) => (
              <div
                key={`${img.url}-${index}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-slate-200/70 bg-white hover:border-[var(--lilac-500)] sm:rounded-2xl"
              >
                <Image src={img.url} alt={product.name} fill className="object-contain p-3 sm:p-4" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs">{product.brand}</div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:mt-2 sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-1 text-[11px] text-slate-500 sm:mt-2 sm:text-xs">SKU: {product.sku}</div>
          </div>
          <div className="rounded-xl border border-lilac bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {formatPrice(product.salePrice)}
              </div>
              {product.oldPrice && (
                <div className="text-xs text-slate-400 line-through sm:text-sm">
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

      <section className="mt-8 sm:mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">З цим купують</h2>
          <Link href="/catalog" className="text-xs text-slate-500">
            Дивитися всі
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
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

      <section className="mt-8 sm:mt-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Схожі товари</h2>
          <Link href="/catalog" className="text-xs text-slate-500">
            Дивитися всі
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
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

      <section className="mt-8 sm:mt-12">
        <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Відгуки</h2>
        <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-[1.1fr_0.9fr]">
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
