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

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <nav className="mt-10 flex items-center justify-center gap-2 sm:gap-4 text-sm" aria-label="Пагінація">
      {isFirst ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600 cursor-not-allowed">
          ←
        </span>
      ) : (
        <Link
          href={makeHref(page - 1)}
          aria-label="Попередня сторінка"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-lilac text-slate-700 dark:text-slate-300 hover:bg-[var(--lilac-50)] dark:hover:bg-[var(--lilac-900)]/20 transition-colors"
        >
          ←
        </Link>
      )}

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // Show first, last, and +- 1 from current
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            return p === page ? (
              <span
                key={p}
                aria-current="page"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-lilac font-medium text-white shadow-sm"
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={makeHref(p)}
                aria-label={`Сторінка ${p}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {p}
              </Link>
            );
          }
          if (p === page - 2 || p === page + 2) {
            return <span key={p} className="px-1 text-slate-400">...</span>;
          }
          return null;
        })}
      </div>

      {isLast ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600 cursor-not-allowed">
          →
        </span>
      ) : (
        <Link
          href={makeHref(page + 1)}
          aria-label="Наступна сторінка"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-lilac text-slate-700 dark:text-slate-300 hover:bg-[var(--lilac-50)] dark:hover:bg-[var(--lilac-900)]/20 transition-colors"
        >
          →
        </Link>
      )}
    </nav>
  );
}
