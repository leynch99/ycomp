import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";
import { sendOrderShippedSms, sendOrderDeliveredSms } from "@/lib/sms";
import { notifyCustomerOrderStatus } from "@/lib/telegram";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { status, trackingNumber, telegramChatId } = body;

  if (!status) {
    return NextResponse.json({ error: "Status required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Update order
  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      ...(trackingNumber && { trackingNumber }),
    },
  });

  // Send notifications (async, don't wait)
  Promise.all([
    // Email notification
    sendOrderStatusEmail(order.email, {
      number: order.number,
      status,
      trackingNumber: trackingNumber || undefined,
    }),
    // SMS notification for shipped/delivered
    status === "SHIPPED" && trackingNumber
      ? sendOrderShippedSms({
          number: order.number,
          phone: order.phone,
          trackingNumber,
        })
      : status === "DELIVERED"
      ? sendOrderDeliveredSms({
          number: order.number,
          phone: order.phone,
        })
      : Promise.resolve(false),
    // Telegram notification if chat ID provided
    telegramChatId
      ? notifyCustomerOrderStatus(telegramChatId, {
          number: order.number,
          status,
          trackingNumber: trackingNumber || undefined,
        })
      : Promise.resolve(false),
  ]).catch((error) => {
    console.error("[order-status] Failed to send notifications:", error);
  });

  return NextResponse.json({ success: true, order: updated });
}
