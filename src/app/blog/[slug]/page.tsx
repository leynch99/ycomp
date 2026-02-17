import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BlogBody } from "@/components/BlogBody";
import { absoluteUrl } from "@/lib/seo";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
  });
  if (!post) return {};
  const desc = post.excerpt ?? post.body.slice(0, 160).replace(/\s+/g, " ").trim();
  return {
    title: post.title,
    description: desc,
    openGraph: {
      title: `${post.title} | YComp`,
      description: desc,
      url: `/blog/${post.slug}`,
      images: post.imageUrl ? [{ url: post.imageUrl.startsWith("http") ? post.imageUrl : absoluteUrl(post.imageUrl), alt: post.title }] : undefined,
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug, isPublished: true },
  });
  if (!post) return notFound();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Блог", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? post.body.slice(0, 200),
    image: post.imageUrl,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: "YComp" },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>

      <Breadcrumbs
        items={[
          { title: "Головна", href: "/" },
          { title: "Блог", href: "/blog" },
          { title: post.title },
        ]}
      />

      {post.imageUrl && (
        <div className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>
      )}

      <header className="mt-6">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{post.title}</h1>
        <time
          dateTime={typeof post.createdAt === "string" ? post.createdAt : post.createdAt.toISOString()}
          className="mt-2 block text-sm text-slate-500"
        >
          {new Date(post.createdAt).toLocaleDateString("uk-UA", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </header>

      <div className="mt-6">
        <BlogBody content={post.body} />
      </div>

      <div className="mt-10 border-t border-slate-200 pt-6">
        <Link
          href="/blog"
          className="text-sm text-[var(--lilac-600)] hover:underline"
        >
          ← Всі пости
        </Link>
      </div>
    </article>
  );
}
