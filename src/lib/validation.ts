import { z } from "zod";

/**
 * Validation schemas for API endpoints
 */

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
  challengeId: z.string().optional(),
  challengeAnswer: z.union([z.string(), z.number()]).optional(),
});

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().regex(/^\+380\d{9}$/, "Invalid phone format").optional(),
});

// Order schemas
export const orderItemSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  salePrice: z.number().int().positive(),
  qty: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^\+380\d{9}$/),
  email: z.string().email().max(255),
  city: z.string().min(1).max(100),
  npBranch: z.string().min(1).max(255),
  paymentMethod: z.enum(["cash", "card", "online"]),
  comment: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1).max(50),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  sku: z.string().min(1).max(100),
  brand: z.string().min(1).max(100),
  description: z.string().min(1),
  categoryId: z.string().cuid(),
  supplierId: z.string().cuid(),
  costPrice: z.number().int().positive(),
  salePrice: z.number().int().positive(),
  oldPrice: z.number().int().positive().optional(),
  stockQty: z.number().int().min(0).optional(),
  inStock: z.boolean().default(true),
  leadTimeMinDays: z.number().int().min(0).optional(),
  leadTimeMaxDays: z.number().int().min(0).optional(),
  isDeal: z.boolean().default(false),
  isOutlet: z.boolean().default(false),
  specs: z.string().optional(),
  // Hardware specs
  socket: z.string().max(50).optional(),
  cores: z.number().int().positive().optional(),
  threads: z.number().int().positive().optional(),
  chipset: z.string().max(50).optional(),
  formFactor: z.string().max(50).optional(),
  ramType: z.string().max(50).optional(),
  ramCapacity: z.number().int().positive().optional(),
  ramFrequency: z.number().int().positive().optional(),
  storageType: z.string().max(50).optional(),
  storageCapacity: z.number().int().positive().optional(),
  psuWattage: z.number().int().positive().optional(),
  psuCert: z.string().max(50).optional(),
  powerW: z.number().int().positive().optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Contact schemas
export const quickContactSchema = z.object({
  phone: z.string().regex(/^\+380\d{9}$/),
  question: z.string().min(1).max(500),
});

export const tradeInSchema = z.object({
  deviceType: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  condition: z.enum(["excellent", "good", "fair", "poor"]),
  photoUrl: z.string().url().optional(),
  contacts: z.string().min(1).max(255),
  comment: z.string().max(500).optional(),
});

export const serviceRequestSchema = z.object({
  serviceType: z.string().min(1).max(100),
  contacts: z.string().min(1).max(255),
  comment: z.string().max(500).optional(),
});

// Admin schemas
export const createBannerSchema = z.object({
  type: z.enum(["hero", "tile"]),
  title: z.string().min(1).max(255),
  subtitle: z.string().max(255).optional(),
  imageUrl: z.string().url(),
  linkUrl: z.string().min(1).max(500),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateBannerSchema = createBannerSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  parentId: z.string().cuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Helper function to validate and parse request body
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: `${firstError.path.join(".")}: ${firstError.message}`,
      };
    }
    return { success: false, error: "Invalid request body" };
  }
}
