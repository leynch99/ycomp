import { prisma } from "@/lib/prisma";
import { AdminContentClient } from "@/components/admin/AdminContentClient";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const pages = await prisma.contentPage.findMany({
    orderBy: { slug: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Контент-сторінки</h1>
      <AdminContentClient pages={pages} />
    </div>
  );
}
