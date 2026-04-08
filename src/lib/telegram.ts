/**
 * Telegram Bot integration for order notifications and customer support
 *
 * Setup:
 * 1. Create bot via @BotFather
 * 2. Get bot token
 * 3. Set TELEGRAM_BOT_TOKEN in .env
 * 4. Set TELEGRAM_ADMIN_CHAT_ID for admin notifications
 */

const TELEGRAM_API = "https://api.telegram.org/bot";

interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  disable_web_page_preview?: boolean;
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
  };
}

/**
 * Send message via Telegram Bot API
 */
export async function sendTelegramMessage(message: TelegramMessage): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[telegram] TELEGRAM_BOT_TOKEN not set, skipping notification");
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    if (!data.ok) {
      console.error("[telegram] Send failed:", data.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[telegram] Error sending message:", error);
    return false;
  }
}

/**
 * Send order notification to admin
 */
export async function notifyAdminNewOrder(order: {
  number: string;
  customerName: string;
  phone: string;
  total: number;
  itemCount: number;
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) return false;

  const text = `
🛒 <b>Новий замовлення #${order.number}</b>

👤 Клієнт: ${order.customerName}
📞 Телефон: ${order.phone}
💰 Сума: ${(order.total / 100).toFixed(2)} грн
📦 Товарів: ${order.itemCount}

<a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders">Переглянути в адмін-панелі</a>
  `.trim();

  return sendTelegramMessage({
    chat_id: adminChatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

/**
 * Send order status update to customer
 */
export async function notifyCustomerOrderStatus(
  chatId: string,
  order: {
    number: string;
    status: string;
    trackingNumber?: string;
  }
) {
  const statusEmoji: Record<string, string> = {
    NEW: "🆕",
    CONFIRMED: "✅",
    PROCESSING: "📦",
    SHIPPED: "🚚",
    DELIVERED: "✨",
    CANCELLED: "❌",
  };

  const statusText: Record<string, string> = {
    NEW: "Новий",
    CONFIRMED: "Підтверджено",
    PROCESSING: "В обробці",
    SHIPPED: "Відправлено",
    DELIVERED: "Доставлено",
    CANCELLED: "Скасовано",
  };

  let text = `
${statusEmoji[order.status] || "📋"} <b>Статус замовлення #${order.number}</b>

Статус: ${statusText[order.status] || order.status}
  `.trim();

  if (order.trackingNumber) {
    text += `\n\n📮 ТТН: <code>${order.trackingNumber}</code>`;
  }

  const buttons = [];
  if (order.trackingNumber) {
    buttons.push([
      {
        text: "🔍 Відстежити посилку",
        url: `https://novaposhta.ua/tracking/?cargo_number=${order.trackingNumber}`,
      },
    ]);
  }

  return sendTelegramMessage({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: buttons.length > 0 ? { inline_keyboard: buttons } : undefined,
  });
}

/**
 * Send promotional message to customer
 */
export async function sendPromoMessage(
  chatId: string,
  promo: {
    title: string;
    description: string;
    url?: string;
  }
) {
  const text = `
🎉 <b>${promo.title}</b>

${promo.description}
  `.trim();

  const buttons = promo.url
    ? [[{ text: "Переглянути", url: promo.url }]]
    : undefined;

  return sendTelegramMessage({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    reply_markup: buttons ? { inline_keyboard: buttons } : undefined,
  });
}

/**
 * Format price for display
 */
function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2);
}

/**
 * Send order confirmation to customer
 */
export async function notifyCustomerOrderConfirmed(
  chatId: string,
  order: {
    number: string;
    customerName: string;
    total: number;
    items: Array<{ name: string; qty: number; price: number }>;
  }
) {
  const itemsList = order.items
    .map((item) => `  • ${item.name} × ${item.qty} = ${formatPrice(item.price * item.qty)} грн`)
    .join("\n");

  const text = `
✅ <b>Замовлення підтверджено!</b>

Номер: #${order.number}
Клієнт: ${order.customerName}

<b>Товари:</b>
${itemsList}

<b>Разом: ${formatPrice(order.total)} грн</b>

Ми зв'яжемося з вами найближчим часом для уточнення деталей доставки.
  `.trim();

  return sendTelegramMessage({
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  });
}

/**
 * Notify admin about low stock
 */
export async function notifyAdminLowStock(product: {
  name: string;
  sku: string;
  stockQty: number;
  threshold: number;
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) return false;

  const text = `
⚠️ <b>Низький залишок товару</b>

Товар: ${product.name}
SKU: ${product.sku}
Залишок: ${product.stockQty} шт
Поріг: ${product.threshold} шт

<a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/products">Переглянути в адмін-панелі</a>
  `.trim();

  return sendTelegramMessage({
    chat_id: adminChatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

/**
 * Notify admin about new contact request
 */
export async function notifyAdminContactRequest(request: {
  phone: string;
  question: string;
  createdAt: Date;
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) return false;

  const text = `
📞 <b>Новий запит на зворотній дзвінок</b>

Телефон: ${request.phone}
Питання: ${request.question}
Час: ${request.createdAt.toLocaleString("uk-UA")}

<a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/contacts">Переглянути в адмін-панелі</a>
  `.trim();

  return sendTelegramMessage({
    chat_id: adminChatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}
