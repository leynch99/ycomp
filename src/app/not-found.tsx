import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="animate-fade-in animate-slide-up rounded-3xl glass bg-white/70 p-8 shadow-2xl dark:bg-slate-900/40 sm:p-12">
        <div className="text-7xl">🛸</div>
        <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Сторінку не знайдено
        </h1>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          Здається, ви перейшли за неправильним посиланням або сторінка була видалена. <br className="hidden sm:block" />
          Поверніться на головну, щоб знайти потрібний товар.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className="rounded-full bg-lilac px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-lilac/30 transition-transform hover:scale-105 active:scale-95"
          >
            На головну сторінку
          </Link>
          <Link
            href="/catalog"
            className="rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-lilac hover:text-lilac dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-lilac dark:hover:text-lilac"
          >
            В каталог
          </Link>
        </div>
      </div>
    </div>
  );
}
