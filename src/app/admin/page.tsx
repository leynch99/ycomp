import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  const [ordersCount, revenue, margin, pendingPayouts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.orderItem.aggregate({ _sum: { margin: true } }),
    prisma.supplierPayout.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Orders count" value={ordersCount.toString()} />
        <Stat label="Revenue" value={formatPrice(revenue._sum.total ?? 0)} />
        <Stat label="Gross margin" value={formatPrice(margin._sum.margin ?? 0)} />
        <Stat label="Pending payouts" value={formatPrice(pendingPayouts._sum.amount ?? 0)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-lilac bg-white p-4">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}
