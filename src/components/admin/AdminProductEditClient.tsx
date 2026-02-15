"use client";

import { AdminProductForm } from "./AdminProductForm";

type Option = { id: string; name: string };

type ProductData = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  description: string;
  categoryId: string;
  supplierId: string;
  costPrice: number;
  salePrice: number;
  oldPrice: number | null;
  inStock: boolean;
  stockQty: number | null;
  isDeal: boolean;
  isOutlet: boolean;
  popularity: number;
  leadTimeMinDays: number;
  leadTimeMaxDays: number;
  images: string[];
};

export function AdminProductEditClient({
  categories,
  suppliers,
  product,
}: {
  categories: Option[];
  suppliers: Option[];
  product: ProductData;
}) {
  return (
    <AdminProductForm
      categories={categories}
      suppliers={suppliers}
      initial={product}
    />
  );
}
