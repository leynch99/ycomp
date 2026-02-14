import { prisma } from "@/lib/prisma";
import { AdminContentClient } from "@/components/admin/AdminContentClient";

export default async function AdminContentPage() {
  const pages = await prisma.contentPage.findMany({
    orderBy: { slug: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Content pages</h1>
      <AdminContentClient pages={pages} />
    </div>
  );
}
