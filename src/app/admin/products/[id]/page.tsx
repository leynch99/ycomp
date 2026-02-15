import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminProductEditClient } from "@/components/admin/AdminProductEditClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const [product, categories, suppliers] = await Promise.all([
    prisma.product.findUnique({
      where: { id: resolvedParams.id },
      include: {
        images: { orderBy: { position: "asc" } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) return notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-xs text-slate-500 hover:text-slate-700">
          ← Назад до товарів
        </Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Редагування: {product.name}</h1>
      <AdminProductEditClient
        categories={categories}
        suppliers={suppliers}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          brand: product.brand,
          description: product.description ?? "",
          categoryId: product.categoryId,
          supplierId: product.supplierId,
          costPrice: product.costPrice,
          salePrice: product.salePrice,
          oldPrice: product.oldPrice,
          inStock: product.inStock,
          stockQty: product.stockQty,
          isDeal: product.isDeal,
          isOutlet: product.isOutlet,
          popularity: product.popularity,
          leadTimeMinDays: product.leadTimeMinDays ?? 1,
          leadTimeMaxDays: product.leadTimeMaxDays ?? 7,
          images: product.images.map((img) => img.url),
        }}
      />
    </div>
  );
}
