import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLang, t } from "@/lib/i18n";
import { HeaderClient } from "@/components/HeaderClient";
import { QuickContactButton } from "@/components/QuickContactButton";

export async function Header() {
  const lang = await getLang();
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return (
    <header className="sticky top-0 z-40 bg-white">
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
          <Link href="/" className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            YComp
          </Link>
          <HeaderClient lang={lang} categories={categories} />
          <nav className="ml-auto hidden items-center gap-4 text-xs text-slate-600 lg:flex">
            <Link href="/deals">{t(lang, "deals")}</Link>
            <Link href="/outlet">{t(lang, "outlet")}</Link>
            <Link href="/trade-in">{t(lang, "tradeIn")}</Link>
            <Link href="/service">{t(lang, "service")}</Link>
            <Link href="/configurator">{t(lang, "configurator")}</Link>
            <Link href="/blog">{t(lang, "blog")}</Link>
          </nav>
          <Link
            href="/contacts"
            className="ml-2 hidden rounded-full bg-lilac px-4 py-2 text-xs text-white lg:inline-flex"
          >
            {t(lang, "consultation")}
          </Link>
          <QuickContactButton className="hidden h-8 w-8 items-center justify-center rounded-full border border-lilac text-[11px] text-slate-700 lg:inline-flex" label="?" />
        </div>
      </div>
      <div className="hidden border-b bg-white/95 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-2 text-xs text-slate-600">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/c/${cat.slug}`}
              className="whitespace-nowrap rounded-full border border-slate-200 px-3 py-1 hover:border-[var(--lilac-500)] hover:text-[var(--lilac-900)]"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
