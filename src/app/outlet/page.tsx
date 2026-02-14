import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default async function OutletPage() {
  const products = await prisma.product.findMany({
    where: { isOutlet: true },
    take: 24,
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: "Уцінка" }]} />
      <h1 className="mt-4 text-2xl font-semibold">Уцінка</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
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
  );
}
