"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="animate-fade-in animate-slide-up rounded-3xl glass bg-white/70 p-8 shadow-2xl dark:bg-slate-900/40 sm:p-12">
        <div className="text-7xl">🔥</div>
        <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Щось пішло не так
        </h1>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
          Ми вже отримали сповіщення і працюємо над виправленням. <br className="hidden sm:block" />
          Спробуйте оновити сторінку або повернутися на головну.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={() => reset()}
            className="rounded-full bg-lilac px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-lilac/30 transition-transform hover:scale-105 active:scale-95"
          >
            Спробувати знову
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-lilac hover:text-lilac dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-lilac dark:hover:text-lilac"
          >
            На головну
          </Link>
        </div>
      </div>
    </div>
  );
}
