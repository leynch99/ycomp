export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  salePrice: number;
  oldPrice?: number | null;
  stockQty?: number | null;
  inStock: boolean;
  leadTimeMinDays?: number | null;
  leadTimeMaxDays?: number | null;
  image?: string | null;
  categorySlug?: string;
  isDeal?: boolean;
  isOutlet?: boolean;
  socket?: string | null;
  ramType?: string | null;
  psuWattage?: number | null;
  powerW?: number | null;
  chipset?: string | null;
  formFactor?: string | null;
  cores?: number | null;
  threads?: number | null;
  ramCapacity?: number | null;
  ramFrequency?: number | null;
  storageType?: string | null;
  storageCapacity?: number | null;
};

export type CartItem = ProductListItem & {
  qty: number;
};
