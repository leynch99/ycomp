import { prisma } from "@/lib/prisma";
import { buildOrderBy, buildWhere } from "@/lib/catalog";
import { toArray, toNumberArray } from "@/lib/query";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CatalogSort } from "@/components/CatalogSort";
import { Pagination } from "@/components/Pagination";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const page = Number(searchParams.page ?? "1");
  const perPage = 12;
  const params = {
    q: typeof searchParams.q === "string" ? searchParams.q : undefined,
    brand: toArray(searchParams.brand),
    minPrice: Number(searchParams.minPrice ?? "") || undefined,
    maxPrice: Number(searchParams.maxPrice ?? "") || undefined,
    inStock: typeof searchParams.inStock === "string" ? searchParams.inStock : undefined,
    lead: typeof searchParams.lead === "string" ? searchParams.lead : undefined,
    socket: toArray(searchParams.socket),
    cores: toNumberArray(searchParams.cores),
    threads: toNumberArray(searchParams.threads),
    chipset: toArray(searchParams.chipset),
    formFactor: toArray(searchParams.formFactor),
    ramType: toArray(searchParams.ramType),
    ramCapacity: toNumberArray(searchParams.ramCapacity),
    ramFrequency: toNumberArray(searchParams.ramFrequency),
    storageType: toArray(searchParams.storageType),
    storageCapacity: toNumberArray(searchParams.storageCapacity),
    psuWattage: toNumberArray(searchParams.psuWattage),
    psuCert: toArray(searchParams.psuCert),
    sort: typeof searchParams.sort === "string" ? searchParams.sort : undefined,
  };

  const where = buildWhere(params);
  const [total, products, meta] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      take: perPage,
      skip: (page - 1) * perPage,
      orderBy: buildOrderBy(params.sort),
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.product.findMany({
      where,
      select: {
        brand: true,
        socket: true,
        cores: true,
        threads: true,
        chipset: true,
        formFactor: true,
        ramType: true,
        ramCapacity: true,
        ramFrequency: true,
        storageType: true,
        storageCapacity: true,
        psuWattage: true,
        psuCert: true,
      },
      take: 200,
    }),
  ]);

  const unique = (values: Array<string | number | null | undefined>) =>
    Array.from(new Set(values.filter(Boolean) as Array<string | number>)).map((v) => ({
      label: String(v),
      value: String(v),
    }));

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const query = new URLSearchParams(
    Object.entries(searchParams).flatMap(([key, value]) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.map((v) => [key, v]);
      return [[key, value]];
    }),
  );

  const tabQuery = new URLSearchParams(query.toString());
  const buildTab = (lead?: string, inStock?: boolean) => {
    const next = new URLSearchParams(tabQuery.toString());
    if (lead) next.set("lead", lead);
    else next.delete("lead");
    if (inStock) next.set("inStock", "true");
    else next.delete("inStock");
    next.set("page", "1");
    return `?${next.toString()}`;
  };
  const activeLead = params.lead ?? "all";

  const compact = searchParams.view === "compact";

  return (
    <div className="bg-[var(--lilac-50)]/40 py-6">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Breadcrumbs items={[{ title: "Головна", href: "/" }, { title: "Каталог" }]} />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Каталог</h1>
            <div className="mt-1 text-xs text-slate-500">
              Знайдено {total} товарів · Сторінка {page} з {totalPages}
            </div>
          </div>
          <div className="flex items-center gap-3">
          <a
            href={`?${new URLSearchParams({ ...Object.fromEntries(query), view: "default" }).toString()}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              !compact ? "border-lilac bg-lilac text-white" : "border-slate-200 text-slate-600"
            }`}
          >
            Звичайний
          </a>
          <a
            href={`?${new URLSearchParams({ ...Object.fromEntries(query), view: "compact" }).toString()}`}
            className={`rounded-full border px-3 py-1 text-xs ${
              compact ? "border-lilac bg-lilac text-white" : "border-slate-200 text-slate-600"
            }`}
          >
            Компактний
          </a>
          <CatalogSort />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {[
          { key: "all", label: "Усі" },
          { key: "inStock", label: "В наявності" },
          { key: "1-3", label: "Під замовлення 1–3 дні" },
          { key: "3-7", label: "Під замовлення 3–7 днів" },
        ].map((tab) => (
          <a
            key={tab.key}
            href={buildTab(tab.key === "all" || tab.key === "inStock" ? undefined : tab.key, tab.key === "inStock")}
            className={`rounded-full border px-3 py-1 ${
              activeLead === tab.key || (tab.key === "inStock" && params.inStock === "true")
                ? "border-lilac bg-lilac text-white"
                : "border-slate-200 text-slate-600"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="rounded-2xl border border-slate-200/70 bg-white p-4 lg:sticky lg:top-32 lg:h-fit">
            <div className="text-sm font-semibold text-slate-900">Фільтри</div>
            <div className="mt-4">
              <CatalogFilters
                brands={unique(meta.map((m) => m.brand))}
                sockets={unique(meta.map((m) => m.socket))}
                cores={unique(meta.map((m) => m.cores))}
                threads={unique(meta.map((m) => m.threads))}
                chipsets={unique(meta.map((m) => m.chipset))}
                formFactors={unique(meta.map((m) => m.formFactor))}
                ramTypes={unique(meta.map((m) => m.ramType))}
                ramCapacities={unique(meta.map((m) => m.ramCapacity))}
                ramFrequencies={unique(meta.map((m) => m.ramFrequency))}
                storageTypes={unique(meta.map((m) => m.storageType))}
                storageCapacities={unique(meta.map((m) => m.storageCapacity))}
                psuWattages={unique(meta.map((m) => m.psuWattage))}
                psuCerts={unique(meta.map((m) => m.psuCert))}
              />
            </div>
          </aside>
          <section>
            {products.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/70 bg-white p-6 text-sm text-slate-600">
                Нічого не знайдено. Спробуйте змінити фільтри.
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    compact={compact}
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      sku: product.sku,
                      brand: product.brand,
                      salePrice: product.salePrice,
                      oldPrice: product.oldPrice,
                      stockQty: product.stockQty,
                      inStock: product.inStock,
                      leadTimeMinDays: product.leadTimeMinDays,
                      leadTimeMaxDays: product.leadTimeMaxDays,
                      image: product.images[0]?.url,
                      isDeal: product.isDeal,
                      isOutlet: product.isOutlet,
                    }}
                  />
                ))}
              </div>
            )}
            <Pagination page={page} totalPages={totalPages} basePath="/catalog" query={query} />
          </section>
        </div>
      </div>
    </div>
  );
}
