export const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ycomp.ua";

export function absoluteUrl(path: string) {
  const base = siteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
