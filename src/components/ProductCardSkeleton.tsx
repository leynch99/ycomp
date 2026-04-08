export function ProductCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex h-full flex-col rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-900/60 p-4"
        >
          {/* Image placeholder */}
          <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 animate-shimmer" />

          {/* Title lines */}
          <div className="mt-4 space-y-2">
            <div className="h-3 w-4/5 rounded bg-slate-100 dark:bg-slate-800 animate-shimmer" />
            <div className="h-3 w-3/5 rounded bg-slate-100 dark:bg-slate-800 animate-shimmer" />
          </div>

          {/* Brand */}
          <div className="mt-2 h-2.5 w-1/3 rounded bg-slate-100 dark:bg-slate-800 animate-shimmer" />

          {/* Price */}
          <div className="mt-3 h-5 w-1/4 rounded bg-slate-100 dark:bg-slate-800 animate-shimmer" />

          {/* Button */}
          <div className="mt-auto pt-4">
            <div className="h-9 w-full rounded-full bg-slate-100 dark:bg-slate-800 animate-shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}
