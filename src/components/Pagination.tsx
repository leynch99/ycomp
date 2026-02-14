import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
  query,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  query: URLSearchParams;
}) {
  if (totalPages <= 1) return null;
  const makeHref = (p: number) => {
    const q = new URLSearchParams(query);
    q.set("page", String(p));
    return `${basePath}?${q.toString()}`;
  };
  return (
    <div className="mt-8 flex items-center justify-center gap-2 text-sm">
      <Link
        href={makeHref(Math.max(1, page - 1))}
        className="rounded-full border border-lilac px-3 py-1 text-xs"
      >
        ←
      </Link>
      <span className="px-2 text-xs text-slate-500">
        {page} / {totalPages}
      </span>
      <Link
        href={makeHref(Math.min(totalPages, page + 1))}
        className="rounded-full border border-lilac px-3 py-1 text-xs"
      >
        →
      </Link>
    </div>
  );
}
