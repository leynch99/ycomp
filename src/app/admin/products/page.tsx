import { prisma } from "@/lib/prisma";
import { AdminProductsClient } from "@/components/admin/AdminProductsClient";

export default async function AdminProductsPage() {
  const [categories, suppliers, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.supplier.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, brand: true, salePrice: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
      <AdminProductsClient categories={categories} suppliers={suppliers} products={products} />
    </div>
  );
}
