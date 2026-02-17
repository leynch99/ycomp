import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Блог",
  description: "Огляди комплектуючих, гайди по збірці ПК та корисні поради від YComp.",
  openGraph: { title: "Блог | YComp", url: "/blog" },
};

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: "Блог" }]} />
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">Блог</h1>
      <p className="mt-2 text-sm text-slate-600">Огляди, гайди та готові збірки</p>

      <div className="mt-8 space-y-6">
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Поки що немає публікацій.
          </p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-[var(--lilac-300)] hover:shadow-md"
            >
              {post.imageUrl && (
                <div className="relative h-48 w-full bg-slate-100 sm:h-56">
                  <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-900">{post.title}</h2>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
                )}
                <div className="mt-3 text-xs text-slate-400">
                  {new Date(post.createdAt).toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
