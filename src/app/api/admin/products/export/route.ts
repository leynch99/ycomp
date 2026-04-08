import { NextResponse } from "next/server";
import { withPermission } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";

/**
 * Export products to CSV
 */

async function exportProductsHandler(request: Request, { user }: { user: any }) {
  const { searchParams } = new URL(request.url);

  const filters: Record<string, unknown> = {};

  // Apply filters
  const categoryId = searchParams.get("categoryId");
  const supplierId = searchParams.get("supplierId");
  const inStock = searchParams.get("inStock");
  const isDeal = searchParams.get("isDeal");
  const isOutlet = searchParams.get("isOutlet");
  const search = searchParams.get("search");

  if (categoryId) filters.categoryId = categoryId;
  if (supplierId) filters.supplierId = supplierId;
  if (inStock !== null) filters.inStock = inStock === "true";
  if (isDeal !== null) filters.isDeal = isDeal === "true";
  if (isOutlet !== null) filters.isOutlet = isOutlet === "true";
  if (search) {
    filters.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where: filters,
    include: {
      category: { select: { name: true } },
      supplier: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Generate CSV
  const headers = [
    "ID",
    "SKU",
    "Name",
    "Brand",
    "Category",
    "Supplier",
    "Cost Price",
    "Sale Price",
    "Old Price",
    "Stock Qty",
    "In Stock",
    "Is Deal",
    "Is Outlet",
    "Popularity",
    "Created At",
  ];

  const rows = products.map((p) => [
    p.id,
    p.sku,
    `"${p.name.replace(/"/g, '""')}"`,
    p.brand,
    p.category.name,
    p.supplier.name,
    (p.costPrice / 100).toFixed(2),
    (p.salePrice / 100).toFixed(2),
    p.oldPrice ? (p.oldPrice / 100).toFixed(2) : "",
    p.stockQty ?? "",
    p.inStock ? "Yes" : "No",
    p.isDeal ? "Yes" : "No",
    p.isOutlet ? "Yes" : "No",
    p.popularity,
    p.createdAt.toISOString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="products-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

export const GET = withPermission("products", "export", exportProductsHandler);
