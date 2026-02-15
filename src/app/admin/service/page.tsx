import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminServicePage() {
  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Сервіс заявки</h1>
      <div className="rounded-xl border border-slate-200/70 bg-white p-4 text-sm">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="py-2">Послуга</th>
              <th className="py-2">Контакти</th>
              <th className="py-2">Коментар</th>
              <th className="py-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-t border-slate-100">
                <td className="py-2">{req.serviceType}</td>
                <td className="py-2">{req.contacts}</td>
                <td className="py-2">{req.comment ?? "—"}</td>
                <td className="py-2">{req.status}</td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={4} className="py-4 text-center text-slate-400">Заявок поки немає</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
