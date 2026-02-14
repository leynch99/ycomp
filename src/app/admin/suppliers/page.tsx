import { prisma } from "@/lib/prisma";
import { AdminSuppliersClient } from "@/components/admin/AdminSuppliersClient";

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Suppliers</h1>
      <AdminSuppliersClient suppliers={suppliers} />
    </div>
  );
}
