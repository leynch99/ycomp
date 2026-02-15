import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

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
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Панель керування</h1>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <Stat label="Замовлень" value={ordersCount.toString()} />
        <Stat label="Виручка" value={formatPrice(revenue._sum.total ?? 0)} />
        <Stat label="Маржа" value={formatPrice(margin._sum.margin ?? 0)} />
        <Stat label="Виплати (очікування)" value={formatPrice(pendingPayouts._sum.amount ?? 0)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-lilac bg-white p-4 sm:rounded-2xl">
      <div className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-[11px]">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-900 sm:mt-2 sm:text-lg">{value}</div>
    </div>
  );
}
