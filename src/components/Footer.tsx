import Link from "next/link";
import { QuickContactButton } from "@/components/QuickContactButton";

export function Footer() {
  return (
    <footer className="border-t border-slate-200/70 dark:border-white/10 bg-gradient-to-br from-white via-[var(--lilac-50)] to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:py-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <div className="text-lg font-semibold text-slate-900 dark:text-white">ycomp.ua</div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
            Комплектуючі, ПК та сервіс для геймерів і професіоналів.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
            <QuickContactButton className="rounded-full bg-lilac px-4 py-2 text-xs text-white" />
            <Link
              href="/contacts"
              className="rounded-full border border-lilac px-4 py-2 text-xs text-slate-700 dark:text-slate-200 dark:border-white/20"
            >
              Контакти
            </Link>
          </div>
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 sm:mt-4 sm:text-sm">
            <div>+38 (044) 200-12-34</div>
            <div>support@ycomp.ua</div>
            <div>Київ, Україна</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm md:contents">
          <nav aria-label="Покупцям">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:text-xs">Покупцям</div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 sm:mt-3 sm:space-y-2 sm:text-sm">
              <li><Link href="/delivery" className="transition hover:text-lilac dark:hover:text-lilac-400">Доставка</Link></li>
              <li><Link href="/payment" className="transition hover:text-lilac dark:hover:text-lilac-400">Оплата</Link></li>
              <li><Link href="/warranty" className="transition hover:text-lilac dark:hover:text-lilac-400">Гарантія</Link></li>
              <li><Link href="/terms" className="transition hover:text-lilac dark:hover:text-lilac-400">Умови</Link></li>
              <li><Link href="/privacy" className="transition hover:text-lilac dark:hover:text-lilac-400">Конфіденційність</Link></li>
            </ul>
          </nav>
          <nav aria-label="Сервіси">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:text-xs">Сервіси</div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 sm:mt-3 sm:space-y-2 sm:text-sm">
              <li><Link href="/trade-in" className="transition hover:text-lilac dark:hover:text-lilac-400">Trade-in</Link></li>
              <li><Link href="/service" className="transition hover:text-lilac dark:hover:text-lilac-400">Сервіс</Link></li>
              <li><Link href="/configurator" className="transition hover:text-lilac dark:hover:text-lilac-400">Конфігуратор</Link></li>
              <li><Link href="/deals" className="transition hover:text-lilac dark:hover:text-lilac-400">Акції</Link></li>
              <li><Link href="/outlet" className="transition hover:text-lilac dark:hover:text-lilac-400">Уцінка</Link></li>
            </ul>
          </nav>
          <nav aria-label="Компанія">
            <div className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500 sm:text-xs">Компанія</div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 sm:mt-3 sm:space-y-2 sm:text-sm">
              <li><Link href="/about" className="transition hover:text-lilac dark:hover:text-lilac-400">Про нас</Link></li>
              <li><Link href="/contacts" className="transition hover:text-lilac dark:hover:text-lilac-400">Контакти</Link></li>
              <li><Link href="/account" className="transition hover:text-lilac dark:hover:text-lilac-400">Кабінет</Link></li>
              <li><Link href="/blog" className="transition hover:text-lilac dark:hover:text-lilac-400">Блог</Link></li>
            </ul>
            <div className="mt-3 flex gap-2 sm:mt-4">
              <a
                href="https://instagram.com/ycomp.ua"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:border-[var(--lilac-500)] hover:text-[var(--lilac-700)] dark:hover:text-[var(--lilac-400)]"
                aria-label="Instagram"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" /></svg>
              </a>
              <a
                href="https://facebook.com/ycomp.ua"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:border-[var(--lilac-500)] hover:text-[var(--lilac-700)] dark:hover:text-[var(--lilac-400)]"
                aria-label="Facebook"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" /></svg>
              </a>
              <a
                href="https://youtube.com/@ycomp_ua"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition hover:border-[var(--lilac-500)] hover:text-[var(--lilac-700)] dark:hover:text-[var(--lilac-400)]"
                aria-label="YouTube"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.35 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" /></svg>
              </a>
            </div>
          </nav>
        </div>
      </div>
      <div className="border-t border-slate-200/70 dark:border-white/10 py-3 text-center text-[10px] text-slate-500 dark:text-slate-400 sm:py-4 sm:text-xs">
        © 2026 ycomp.ua. Всі права захищені. | Політика конфіденційності
      </div>
    </footer>
  );
}
