import { Breadcrumbs } from "@/components/Breadcrumbs";
import { prisma } from "@/lib/prisma";
import { getLang } from "@/lib/i18n";

export async function InfoPage({
  slug,
  title,
  children,
}: {
  slug?: string;
  title: string;
  children: React.ReactNode;
}) {
  const lang = await getLang();
  const content = slug
    ? await prisma.contentPage.findUnique({ where: { slug } })
    : null;
  const pageTitle =
    content ? (lang === "ru" ? content.titleRu : content.titleUa) : title;
  const body =
    content ? (lang === "ru" ? content.bodyRu : content.bodyUa) : null;
  const paragraphs = body?.trim()
    ? body.split(/\n{2,}/).map((part, index) => <p key={index}>{part}</p>)
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: pageTitle }]} />
      <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">{pageTitle}</h1>
      <div className="prose dark:prose-invert mt-6 max-w-none text-sm text-slate-700 dark:text-slate-300">
        {paragraphs ?? children}
      </div>
    </div>
  );
}
