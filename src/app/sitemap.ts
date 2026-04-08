import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const PROD_PER_SITEMAP = 1000;

export async function generateSitemaps() {
  try {
    const totalProducts = await prisma.product.count();
    const chunks = Math.ceil(totalProducts / PROD_PER_SITEMAP);
    const productsChunks = Array.from({ length: chunks }, (_, i) => ({ id: String(i) }));

    return [{ id: "core" }, { id: "categories" }, { id: "blog" }, ...productsChunks];
  } catch (error) {
    console.error("Failed to generate sitemaps:", error);
    // Return minimal sitemap during build if DB is not available
    return [{ id: "core" }];
  }
}

export default async function sitemap({ id }: { id: string }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ycomp.ua";

  if (id === "core") {
    const routes = [
      "", "/blog", "/catalog", "/deals", "/configurator",
      "/trade-in", "/service", "/cart", "/checkout", "/wishlist",
      "/compare", "/delivery", "/payment", "/warranty", "/about",
      "/contacts", "/terms", "/privacy",
    ];
    return routes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: route === "" ? 1 : 0.8,
    }));
  }

  try {
    if (id === "categories") {
      const categories = await prisma.category.findMany({ select: { slug: true } });
      return categories.map((cat) => ({
        url: `${baseUrl}/c/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      }));
    }

    if (id === "blog") {
      const blogPosts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true }
      });
      return blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      }));
    }

    // Otherwise, it's a product chunk (e.g. id="0", "1", "2")
    const pageIndex = Number(id);
    const products = await prisma.product.findMany({
      skip: pageIndex * PROD_PER_SITEMAP,
      take: PROD_PER_SITEMAP,
      select: { slug: true, updatedAt: true },
    });

    return products.map((product) => ({
      url: `${baseUrl}/p/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to generate sitemap for id:", id, error);
    // Return empty sitemap if DB is not available
    return [];
  }
}
