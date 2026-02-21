export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ycomp.ua";

export function absoluteUrl(path: string) {
  const base = siteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/**
 * Build canonical URL for catalog/category to avoid duplicate content.
 * Drops: page (use first page), view, sort (optional).
 * Keeps: q, brand, inStock, lead, price, filters.
 */
/**
 * Build FAQPage JSON-LD schema for service pages.
 */
export function buildFaqSchema(
  faq: Array<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildCatalogCanonical(
  basePath: string,
  searchParams: Record<string, string | string[] | undefined>
): string {
  const keep = ["q", "brand", "minPrice", "maxPrice", "inStock", "lead", "socket", "cores", "threads", "chipset", "formFactor", "ramType", "ramCapacity", "ramFrequency", "storageType", "storageCapacity", "psuWattage", "psuCert"];
  const next = new URLSearchParams();
  for (const key of keep) {
    const v = searchParams[key];
    if (!v) continue;
    if (Array.isArray(v)) {
      for (const item of v) if (item) next.append(key, item);
    } else {
      next.set(key, v);
    }
  }
  const qs = next.toString();
  return absoluteUrl(qs ? `${basePath}?${qs}` : basePath);
}
