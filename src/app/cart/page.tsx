import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CartPageClient } from "@/components/CartPageClient";

export default function CartPage() {
  return (
    <div className="bg-[var(--lilac-50)]/40 py-6">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: "Кошик" }]} />
        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Кошик</h1>
        </div>
        <div className="mt-6">
          <Suspense fallback={<div className="text-sm text-slate-400">Завантаження…</div>}>
            <CartPageClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
