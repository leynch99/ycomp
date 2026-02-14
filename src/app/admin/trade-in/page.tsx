import { prisma } from "@/lib/prisma";

export default async function AdminTradeInPage() {
  const requests = await prisma.tradeInRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Trade-in requests</h1>
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 text-sm">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="py-2">Тип</th>
              <th className="py-2">Модель</th>
              <th className="py-2">Стан</th>
              <th className="py-2">Контакти</th>
              <th className="py-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t border-slate-100">
                <td className="py-2">{req.deviceType}</td>
                <td className="py-2">{req.model}</td>
                <td className="py-2">{req.condition}</td>
                <td className="py-2">{req.contacts}</td>
                <td className="py-2">{req.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
