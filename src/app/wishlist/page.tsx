import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WishlistPageClient } from "@/components/WishlistPageClient";

export default function WishlistPage() {
  return (
    <div className="bg-[var(--lilac-50)]/40 py-6">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: "Обране" }]} />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Обране</h1>
        <div className="mt-6">
          <WishlistPageClient />
        </div>
      </div>
    </div>
  );
}
