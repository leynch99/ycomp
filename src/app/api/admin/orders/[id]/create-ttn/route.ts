import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { createExpressWaybill } from "@/lib/novaposhta";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.trackingNumber) {
    return NextResponse.json(
      { error: "TTN already created", trackingNumber: order.trackingNumber },
      { status: 400 }
    );
  }

  const body = await request.json();
  const {
    senderCityRef,
    senderWarehouseRef,
    recipientCityRef,
    recipientWarehouseRef,
    weight,
    seatsAmount,
  } = body;

  if (!senderCityRef || !senderWarehouseRef || !recipientCityRef || !recipientWarehouseRef) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Calculate total weight (default 1kg if not provided)
    const totalWeight = weight || 1;
    const seats = seatsAmount || 1;

    // Create description from order items
    const description = order.items
      .map((item) => `${item.name} x${item.qty}`)
      .join(", ")
      .slice(0, 100);

    // Create TTN via Nova Poshta API
    const ttn = await createExpressWaybill({
      senderRef: process.env.NP_SENDER_REF!,
      senderCityRef,
      senderWarehouseRef,
      recipientName: order.customerName,
      recipientPhone: order.phone,
      recipientCityRef,
      recipientWarehouseRef,
      paymentMethod: order.paymentMethod === "cash" ? "Cash" : "NonCash",
      cost: order.total / 100, // Convert cents to UAH
      weight: totalWeight,
      seatsAmount: seats,
      description,
    });

    // Update order with tracking number
    await prisma.order.update({
      where: { id },
      data: {
        trackingNumber: ttn.trackingNumber,
        status: "SHIPPED",
      },
    });

    return NextResponse.json({
      success: true,
      trackingNumber: ttn.trackingNumber,
      ref: ttn.ref,
      cost: ttn.cost,
    });
  } catch (error) {
    console.error("[create-ttn] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create TTN" },
      { status: 500 }
    );
  }
}
