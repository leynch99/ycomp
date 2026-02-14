import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CheckoutForm } from "@/components/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="bg-[var(--lilac-50)]/40 py-6">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumbs
          items={[
            { title: "Головна", href: "/" },
            { title: "Кошик", href: "/cart" },
            { title: "Оформлення" },
          ]}
        />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Оформлення замовлення</h1>
        <div className="mt-6">
          <CheckoutForm />
        </div>
      </div>
    </div>
  );
}
