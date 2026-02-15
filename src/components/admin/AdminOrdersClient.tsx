"use client";

import { formatPrice } from "@/lib/utils";

type OrderRow = {
  id: string;
  number: string;
  status: string;
  total: number;
};

const STATUS_LABELS: Record<string, string> = {
  NEW: "Новий",
  CONFIRMED: "Підтверджено",
  SENT_TO_SUPPLIER: "Відправлено постачальнику",
  SHIPPED: "Відвантажено",
  DELIVERED: "Доставлено",
  CLOSED: "Закрито",
  CANCELLED: "Скасовано",
  RETURN_REQUESTED: "Запит на повернення",
  RETURNED: "Повернено",
};

export function AdminOrdersClient({ orders }: { orders: OrderRow[] }) {
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
    <div className="rounded-xl border border-slate-200/70 bg-white p-4 text-sm">
      <table className="w-full">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
            <th className="py-2">№ замовлення</th>
            <th className="py-2">Статус</th>
            <th className="py-2">Сума</th>
            <th className="py-2">Змінити статус</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-slate-100">
              <td className="py-2 font-medium">{order.number}</td>
              <td className="py-2">
                <span className="rounded-full bg-[var(--lilac-50)] px-2 py-0.5 text-[11px] text-[var(--lilac-700)]">
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </td>
              <td className="py-2">{formatPrice(order.total)}</td>
              <td className="py-2">
                <select
                  defaultValue={order.status}
                  onChange={(event) => updateStatus(order.id, event.target.value)}
                  className="rounded-lg border border-lilac px-2 py-1 text-xs text-slate-700"
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan={4} className="py-4 text-center text-slate-400">Замовлень поки немає</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
