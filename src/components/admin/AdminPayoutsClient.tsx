"use client";

import { formatPrice } from "@/lib/utils";

type PayoutRow = {
  id: string;
  supplier: string;
  amount: number;
  status: string;
};

export function AdminPayoutsClient({ payouts }: { payouts: PayoutRow[] }) {
  const markPaid = async (id: string) => {
    await fetch(`/api/admin/payouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "PAID" }),
    });
    window.location.reload();
  };

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-4 text-sm">
      <table className="w-full">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
            <th className="py-2">Постачальник</th>
            <th className="py-2">Сума</th>
            <th className="py-2">Статус</th>
            <th className="py-2">Дія</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr key={payout.id} className="border-t border-slate-100">
              <td className="py-2">{payout.supplier}</td>
              <td className="py-2">{formatPrice(payout.amount)}</td>
              <td className="py-2">
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${payout.status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
                  {payout.status === "PAID" ? "Виплачено" : "Очікує"}
                </span>
              </td>
              <td className="py-2">
                {payout.status === "PENDING" && (
                  <button
                    onClick={() => markPaid(payout.id)}
                    className="rounded-full border border-lilac px-3 py-1 text-[11px] text-slate-700 hover:bg-[var(--lilac-50)]"
                  >
                    Позначити виплаченим
                  </button>
                )}
              </td>
            </tr>
          ))}
          {payouts.length === 0 && (
            <tr><td colSpan={4} className="py-4 text-center text-slate-400">Виплат поки немає</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
