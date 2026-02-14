import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="text-4xl font-semibold">404</div>
      <p className="mt-4 text-sm text-slate-600">Сторінку не знайдено.</p>
      <Link href="/" className="mt-6 inline-flex rounded-full border px-6 py-2 text-sm">
        На головну
      </Link>
    </div>
  );
}
