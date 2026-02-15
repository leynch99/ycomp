import { prisma } from "@/lib/prisma";
import { AdminSuppliersClient } from "@/components/admin/AdminSuppliersClient";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Постачальники</h1>
      <AdminSuppliersClient suppliers={suppliers} />
    </div>
  );
}
