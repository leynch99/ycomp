import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { slug: true } }),
    prisma.product.findMany({ select: { slug: true } }),
  ]);

  const routes = [
    "/",
    "/catalog",
    "/deals",
    "/outlet",
    "/configurator",
    "/trade-in",
    "/service",
    "/cart",
    "/checkout",
    "/wishlist",
    "/compare",
    "/delivery",
    "/payment",
    "/warranty",
    "/about",
    "/contacts",
    "/terms",
    "/privacy",
  ];

  return [
    ...routes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    })),
    ...categories.map((cat) => ({
      url: `${baseUrl}/c/${cat.slug}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/p/${product.slug}`,
      lastModified: new Date(),
    })),
  ];
}
