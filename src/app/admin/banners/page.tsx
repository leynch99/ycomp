import { prisma } from "@/lib/prisma";
import { AdminBannersClient } from "@/components/admin/AdminBannersClient";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: [{ type: "asc" }, { position: "asc" }],
  });

  return (
    <>
      <h1 className="mb-4 text-lg font-semibold text-slate-800 sm:mb-6 sm:text-xl">
        Банери на головній
      </h1>
      <AdminBannersClient initialBanners={banners} />
    </>
  );
}
