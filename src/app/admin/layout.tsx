import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const links = [
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
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <div className="mb-4 text-xs uppercase tracking-[0.2em] text-slate-400 sm:mb-6">
        Admin console
      </div>
      {/* Mobile nav - horizontal scroll */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {links.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:border-[var(--lilac-300)] hover:bg-[var(--lilac-50)]"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[240px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden space-y-2 rounded-2xl border border-slate-200/70 bg-white p-4 text-sm lg:block">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-[var(--lilac-50)] hover:text-[var(--lilac-900)]"
            >
              {label}
            </Link>
          ))}
        </aside>
        <section className="min-w-0 overflow-x-auto rounded-xl border border-slate-200/70 bg-white p-4 shadow-sm sm:rounded-2xl sm:p-6">
          {children}
        </section>
      </div>
    </div>
  );
}
