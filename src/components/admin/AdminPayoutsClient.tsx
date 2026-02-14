"use client";

type PayoutRow = {
  id: string;
  supplier: string;
  amount: number;
  status: string;
};

export function AdminPayoutsClient({ payouts }: { payouts: PayoutRow[] }) {
  const format = (value: number) =>
    new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      maximumFractionDigits: 0,
    }).format(value);
  const markPaid = async (id: string) => {
    await fetch(`/api/admin/payouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    window.location.reload();
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm">
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
              <td className="py-2">{format(payout.amount)}</td>
              <td className="py-2">{payout.status}</td>
              <td className="py-2">
                {payout.status === "PENDING" && (
                  <button
                    onClick={() => markPaid(payout.id)}
                    className="rounded-full border border-lilac px-3 py-1 text-xs text-slate-700"
                  >
                    Позначити як PAID
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
