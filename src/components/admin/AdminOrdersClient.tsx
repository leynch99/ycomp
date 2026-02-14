"use client";

type OrderRow = {
  id: string;
  number: string;
  status: string;
  total: number;
};

export function AdminOrdersClient({ orders }: { orders: OrderRow[] }) {
  const format = (value: number) =>
    new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      maximumFractionDigits: 0,
    }).format(value);
  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    window.location.reload();
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm">
      <table className="w-full">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
            <th className="py-2">№</th>
            <th className="py-2">Статус</th>
            <th className="py-2">Сума</th>
            <th className="py-2">Дія</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-slate-100">
              <td className="py-2">{order.number}</td>
              <td className="py-2">{order.status}</td>
              <td className="py-2">{format(order.total)}</td>
              <td className="py-2">
                <select
                  defaultValue={order.status}
                  onChange={(event) => updateStatus(order.id, event.target.value)}
                  className="rounded-lg border border-lilac px-2 py-1 text-xs text-slate-700"
                >
                  {[
                    "NEW",
                    "CONFIRMED",
                    "SENT_TO_SUPPLIER",
                    "SHIPPED",
                    "DELIVERED",
                    "CLOSED",
                    "CANCELLED",
                    "RETURN_REQUESTED",
                    "RETURNED",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
