import { Prisma } from "@prisma/client";

export type CatalogParams = {
  q?: string;
  brand?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: string;
  lead?: string;
  socket?: string[];
  cores?: number[];
  threads?: number[];
  chipset?: string[];
  formFactor?: string[];
  ramType?: string[];
  ramCapacity?: number[];
  ramFrequency?: number[];
  storageType?: string[];
  storageCapacity?: number[];
  psuWattage?: number[];
  psuCert?: string[];
  sort?: string;
};

export function buildWhere(params: CatalogParams): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { brand: { contains: params.q, mode: "insensitive" } },
      { sku: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params.brand?.length) {
    where.brand = { in: params.brand };
  }

  if (params.inStock === "true") {
    where.inStock = true;
  }

  if (params.lead === "1-3") {
    where.leadTimeMaxDays = { lte: 3 };
  }

  if (params.lead === "3-7") {
    where.leadTimeMinDays = { gte: 3 };
  }

  if (params.minPrice || params.maxPrice) {
    where.salePrice = {};
    if (params.minPrice) where.salePrice.gte = params.minPrice;
    if (params.maxPrice) where.salePrice.lte = params.maxPrice;
  }

  if (params.socket?.length) where.socket = { in: params.socket };
  if (params.cores?.length) where.cores = { in: params.cores };
  if (params.threads?.length) where.threads = { in: params.threads };
  if (params.chipset?.length) where.chipset = { in: params.chipset };
  if (params.formFactor?.length) where.formFactor = { in: params.formFactor };
  if (params.ramType?.length) where.ramType = { in: params.ramType };
  if (params.ramCapacity?.length) where.ramCapacity = { in: params.ramCapacity };
  if (params.ramFrequency?.length) where.ramFrequency = { in: params.ramFrequency };
  if (params.storageType?.length) where.storageType = { in: params.storageType };
  if (params.storageCapacity?.length) where.storageCapacity = { in: params.storageCapacity };
  if (params.psuWattage?.length) where.psuWattage = { in: params.psuWattage };
  if (params.psuCert?.length) where.psuCert = { in: params.psuCert };

  return where;
}

export function buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { salePrice: "asc" };
    case "price_desc":
      return { salePrice: "desc" };
    case "new":
      return { createdAt: "desc" };
    case "popular":
    default:
      return { popularity: "desc" };
  }
}
