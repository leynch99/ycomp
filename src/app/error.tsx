"use client";

import Link from "next/link";

export default function ErrorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="text-4xl font-semibold">500</div>
      <p className="mt-4 text-sm text-slate-600">Щось пішло не так.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full border px-6 py-2 text-sm">
        На головну
      </Link>
    </div>
  );
}
