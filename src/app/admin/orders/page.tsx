import { prisma } from "@/lib/prisma";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, number: true, status: true, total: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>
      <AdminOrdersClient orders={orders} />
    </div>
  );
}
