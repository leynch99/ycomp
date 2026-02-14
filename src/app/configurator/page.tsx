import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ConfiguratorClient } from "@/components/ConfiguratorClient";

export default async function ConfiguratorPage() {
  const categories = [
    "cpu",
    "motherboards",
    "ram",
    "gpu",
    "ssd",
    "psu",
    "cases",
  ];

  const products = await prisma.product.findMany({
    where: { category: { slug: { in: categories } } },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
  });

  const mapList = (slug: string) =>
    products
      .filter((p) => p.category.slug === slug)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        brand: p.brand,
        salePrice: p.salePrice,
        oldPrice: p.oldPrice,
        inStock: p.inStock,
        leadTimeMinDays: p.leadTimeMinDays,
        leadTimeMaxDays: p.leadTimeMaxDays,
        image: p.images[0]?.url,
        socket: p.socket,
        ramType: p.ramType,
        psuWattage: p.psuWattage,
        powerW: p.powerW,
      }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: "Конфігуратор ПК" }]} />
      <h1 className="mt-4 text-2xl font-semibold">Конфігуратор ПК</h1>
      <div className="mt-6">
        <ConfiguratorClient
          cpu={mapList("cpu")}
          motherboard={mapList("motherboards")}
          ram={mapList("ram")}
          gpu={mapList("gpu")}
          ssd={mapList("ssd")}
          psu={mapList("psu")}
          cases={mapList("cases")}
        />
      </div>
    </div>
  );
}
