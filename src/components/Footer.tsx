import Link from "next/link";
import { QuickContactButton } from "@/components/QuickContactButton";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-gradient-to-br from-white via-[var(--lilac-50)] to-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:py-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <div className="text-lg font-semibold text-slate-900">ycomp.ua</div>
          <p className="mt-2 text-xs text-slate-600 sm:text-sm">
            Комплектуючі, ПК та сервіс для геймерів і професіоналів.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
            <QuickContactButton className="rounded-full bg-lilac px-4 py-2 text-xs text-white" />
            <Link
              href="/contacts"
              className="rounded-full border border-lilac px-4 py-2 text-xs text-slate-700"
            >
              Контакти
            </Link>
          </div>
          <div className="mt-3 text-xs text-slate-600 sm:mt-4 sm:text-sm">
            <div>+38 (044) 200-12-34</div>
            <div>support@ycomp.ua</div>
            <div>Київ, Україна</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm md:contents">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">Покупцям</div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 sm:mt-3 sm:space-y-2 sm:text-sm">
              <li><Link href="/delivery">Доставка</Link></li>
              <li><Link href="/payment">Оплата</Link></li>
              <li><Link href="/warranty">Гарантія</Link></li>
              <li><Link href="/terms">Умови</Link></li>
              <li><Link href="/privacy">Конфіденційність</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">Сервіси</div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 sm:mt-3 sm:space-y-2 sm:text-sm">
              <li><Link href="/trade-in">Trade-in</Link></li>
              <li><Link href="/service">Сервіс</Link></li>
              <li><Link href="/configurator">Конфігуратор</Link></li>
              <li><Link href="/deals">Акції</Link></li>
              <li><Link href="/outlet">Уцінка</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400 sm:text-xs">Компанія</div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 sm:mt-3 sm:space-y-2 sm:text-sm">
              <li><Link href="/about">Про нас</Link></li>
              <li><Link href="/contacts">Контакти</Link></li>
              <li><Link href="/account">Кабінет</Link></li>
              <li><Link href="/blog">Блог</Link></li>
            </ul>
            <div className="mt-3 flex gap-2 sm:mt-4">
              {["IG", "FB", "YT"].map((item) => (
                <div
                  key={item}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[9px] text-slate-500 sm:h-8 sm:w-8 sm:text-[10px]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/70 py-3 text-center text-[10px] text-slate-500 sm:py-4 sm:text-xs">
        © 2026 ycomp.ua. Всі права захищені. | Політика конфіденційності
      </div>
    </footer>
  );
}
