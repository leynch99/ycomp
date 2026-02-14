import Link from "next/link";

export function Breadcrumbs({
  items,
}: {
  items: Array<{ title: string; href?: string }>;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.title,
      item: item.href ? `${baseUrl}${item.href}` : undefined,
    })),
  };

  return (
    <nav className="text-xs text-slate-500">
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href} className="hover:text-slate-700">
                {item.title}
              </Link>
            ) : (
              <span>{item.title}</span>
            )}
            {index < items.length - 1 && <span>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
