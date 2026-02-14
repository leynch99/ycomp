import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 text-xs uppercase tracking-[0.2em] text-slate-400">
        Admin console
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2 rounded-2xl border border-slate-200/70 bg-white p-4 text-sm">
          {[
            ["/admin", "Dashboard"],
            ["/admin/orders", "Orders"],
            ["/admin/products", "Products"],
            ["/admin/categories", "Categories"],
            ["/admin/suppliers", "Suppliers"],
            ["/admin/payouts", "Payouts"],
            ["/admin/trade-in", "Trade-in requests"],
            ["/admin/service", "Service requests"],
            ["/admin/contacts", "Quick contact"],
            ["/admin/content", "Content pages"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-[var(--lilac-50)] hover:text-[var(--lilac-900)]"
            >
              {label}
            </Link>
          ))}
        </aside>
        <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          {children}
        </section>
      </div>
    </div>
  );
}
