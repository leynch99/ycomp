import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { ProductPageClient } from "@/components/ProductPageClient";
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

  const specs = [
    { label: "Socket", value: product.socket },
    { label: "Ядра", value: product.cores?.toString() },
    { label: "Потоки", value: product.threads?.toString() },
    { label: "Чіпсет", value: product.chipset },
    { label: "Форм-фактор", value: product.formFactor },
    { label: "Тип памʼяті", value: product.ramType },
    { label: "Обʼєм памʼяті", value: product.ramCapacity ? `${product.ramCapacity} GB` : null },
    { label: "Частота памʼяті", value: product.ramFrequency ? `${product.ramFrequency} MHz` : null },
    { label: "Тип накопичувача", value: product.storageType },
    { label: "Обʼєм накопичувача", value: product.storageCapacity ? `${product.storageCapacity} GB` : null },
    { label: "Потужність БЖ", value: product.psuWattage ? `${product.psuWattage} W` : null },
    { label: "Сертифікат БЖ", value: product.psuCert },
    { label: "TDP", value: product.powerW ? `${product.powerW} W` : null },
  ].filter((s): s is { label: string; value: string } => !!s.value);

  const images = product.images.map((img) => ({ url: img.url }));

  const productUrl = absoluteUrl(`/p/${product.slug}`);
  const mainImageUrl = images[0]?.url ?? "/images/placeholder.svg";
  const imageUrl = mainImageUrl.startsWith("http") ? mainImageUrl : absoluteUrl(mainImageUrl);

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

  const mapItem = (item: typeof similar[number]) => ({
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
  });

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

      <div className="mt-4 sm:mt-6">
        <ProductPageClient
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            brand: product.brand,
            description: product.description,
            salePrice: product.salePrice,
            oldPrice: product.oldPrice,
            inStock: product.inStock,
            stockQty: product.stockQty,
            leadTimeMinDays: product.leadTimeMinDays,
            leadTimeMaxDays: product.leadTimeMaxDays,
            isDeal: product.isDeal,
            isOutlet: product.isOutlet,
            images,
            specs,
          }}
        />
      </div>

      {upsell.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">З цим купують</h2>
            <Link href="/catalog" className="text-xs text-slate-500">Дивитися всі</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
            {upsell.map((item) => (
              <ProductCard key={item.id} product={mapItem(item)} />
            ))}
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="mt-8 sm:mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">Схожі товари</h2>
            <Link href="/catalog" className="text-xs text-slate-500">Дивитися всі</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
            {similar.map((item) => (
              <ProductCard key={item.id} product={mapItem(item)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
