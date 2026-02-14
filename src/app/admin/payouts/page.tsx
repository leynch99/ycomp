import { prisma } from "@/lib/prisma";
import { AdminPayoutsClient } from "@/components/admin/AdminPayoutsClient";

export default async function AdminPayoutsPage() {
  const payouts = await prisma.supplierPayout.findMany({
    orderBy: { createdAt: "desc" },
    include: { supplier: true },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Payouts</h1>
      <AdminPayoutsClient
        payouts={payouts.map((p) => ({
          id: p.id,
          supplier: p.supplier.name,
          amount: p.amount,
          status: p.status,
        }))}
      />
    </div>
  );
}
