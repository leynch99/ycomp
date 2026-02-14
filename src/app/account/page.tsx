import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AccountClient } from "@/components/AccountClient";

export default function AccountPage() {
  return (
    <div className="bg-[var(--lilac-50)]/40 py-6">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: "Кабінет" }]} />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Особистий кабінет</h1>
        <div className="mt-6">
          <AccountClient />
        </div>
      </div>
    </div>
  );
}
