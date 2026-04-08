import { NextResponse } from "next/server";
import { withPermission } from "@/lib/admin-middleware";
import { prisma } from "@/lib/prisma";

/**
 * Bulk operations for products
 * - Update multiple products at once
 * - Delete multiple products
 * - Update stock, prices, status
 */

async function bulkUpdateHandler(request: Request, { user }: { user: any }) {
  const body = await request.json();
  const { productIds, updates } = body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: "Product IDs required" }, { status: 400 });
  }

  if (!updates || typeof updates !== "object") {
    return NextResponse.json({ error: "Updates required" }, { status: 400 });
  }

  // Validate updates
  const allowedFields = [
    "inStock",
    "isDeal",
    "isOutlet",
    "salePrice",
    "oldPrice",
    "stockQty",
    "categoryId",
    "supplierId",
  ];

  const validUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      validUpdates[key] = value;
    }
  }

  if (Object.keys(validUpdates).length === 0) {
    return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
  }

  try {
    const result = await prisma.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: validUpdates,
    });

    return NextResponse.json({
      success: true,
      updated: result.count,
      productIds,
      updates: validUpdates,
    });
  } catch (error) {
    console.error("[bulk-update] Error:", error);
    return NextResponse.json(
      { error: "Failed to update products" },
      { status: 500 }
    );
  }
}

async function bulkDeleteHandler(request: Request, { user }: { user: any }) {
  const body = await request.json();
  const { productIds } = body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: "Product IDs required" }, { status: 400 });
  }

  try {
    // Delete related data first
    await prisma.productImage.deleteMany({
      where: { productId: { in: productIds } },
    });

    await prisma.orderItem.updateMany({
      where: { productId: { in: productIds } },
      data: { productId: null },
    });

    // Delete products
    const result = await prisma.product.deleteMany({
      where: { id: { in: productIds } },
    });

    return NextResponse.json({
      success: true,
      deleted: result.count,
    });
  } catch (error) {
    console.error("[bulk-delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete products" },
      { status: 500 }
    );
  }
}

export const PATCH = withPermission("products", "update", bulkUpdateHandler);
export const DELETE = withPermission("products", "delete", bulkDeleteHandler);
