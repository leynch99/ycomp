import { prisma } from "@/lib/prisma";
import { AdminContactsClient } from "@/components/admin/AdminContactsClient";

export const dynamic = "force-dynamic";

export default async function AdminContactsPage() {
  const requests = await prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Quick contact</h1>
      <AdminContactsClient requests={requests} />
    </div>
  );
}
