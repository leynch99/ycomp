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
              <a
                href="https://instagram.com/ycomp.ua"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-[var(--lilac-500)] hover:text-[var(--lilac-700)]"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
              </a>
              <a
                href="https://facebook.com/ycomp.ua"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-[var(--lilac-500)] hover:text-[var(--lilac-700)]"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" /></svg>
              </a>
              <a
                href="https://youtube.com/@ycomp_ua"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-[var(--lilac-500)] hover:text-[var(--lilac-700)]"
                aria-label="YouTube"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.35 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" /></svg>
              </a>
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
