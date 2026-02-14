import Link from "next/link";
import { QuickContactButton } from "@/components/QuickContactButton";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-gradient-to-br from-white via-[var(--lilac-50)] to-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <div className="text-lg font-semibold text-slate-900">ycomp.ua</div>
          <p className="mt-2 text-sm text-slate-600">
            Комплектуючі, ПК та сервіс для геймерів і професіоналів.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <QuickContactButton className="rounded-full bg-lilac px-4 py-2 text-xs text-white" />
            <Link
              href="/contacts"
              className="rounded-full border border-lilac px-4 py-2 text-xs text-slate-700"
            >
              Контакти
            </Link>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            <div>+38 (044) 200-12-34</div>
            <div>support@ycomp.ua</div>
            <div>Київ, Україна</div>
          </div>
        </div>
        <div className="text-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">Покупцям</div>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li>
              <Link href="/delivery">Доставка</Link>
            </li>
            <li>
              <Link href="/payment">Оплата</Link>
            </li>
            <li>
              <Link href="/warranty">Гарантія</Link>
            </li>
            <li>
              <Link href="/terms">Умови</Link>
            </li>
            <li>
              <Link href="/privacy">Політика конфіденційності</Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">Сервіси</div>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li>
              <Link href="/trade-in">Trade-in</Link>
            </li>
            <li>
              <Link href="/service">Сервіс</Link>
            </li>
            <li>
              <Link href="/configurator">Конфігуратор</Link>
            </li>
            <li>
              <Link href="/deals">Акції</Link>
            </li>
            <li>
              <Link href="/outlet">Уцінка</Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="text-xs uppercase tracking-wide text-slate-400">Компанія</div>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li>
              <Link href="/about">Про нас</Link>
            </li>
            <li>
              <Link href="/contacts">Контакти</Link>
            </li>
            <li>
              <Link href="/account">Кабінет</Link>
            </li>
            <li>
              <Link href="/blog">Блог</Link>
            </li>
          </ul>
          <div className="mt-4 flex gap-2">
            {["IG", "FB", "YT"].map((item) => (
              <div
                key={item}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] text-slate-500"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/70 py-4 text-center text-xs text-slate-500">
        © 2026 ycomp.ua. Всі права захищені. | Політика конфіденційності
      </div>
    </footer>
  );
}
