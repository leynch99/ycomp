/**
 * Email notifications via SendGrid
 *
 * Setup:
 * 1. Create SendGrid account: https://sendgrid.com
 * 2. Create API key with Mail Send permissions
 * 3. Set SENDGRID_API_KEY in .env
 * 4. Set SENDGRID_FROM_EMAIL (verified sender)
 */

import sgMail from "@sendgrid/mail";

const initialized = false;

function initSendGrid() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn("[email] SENDGRID_API_KEY not set, email notifications disabled");
    return false;
  }
  if (!initialized) {
    sgMail.setApiKey(apiKey);
  }
  return true;
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email via SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!initSendGrid()) return false;

  const from = process.env.SENDGRID_FROM_EMAIL || "noreply@ycomp.ua";

  try {
    await sgMail.send({
      to: options.to,
      from,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    });
    console.log(`[email] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[email] Failed to send:", error);
    return false;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(order: {
  number: string;
  customerName: string;
  email: string;
  total: number;
  items: Array<{ name: string; qty: number; price: number }>;
  city: string;
  npBranch: string;
}) {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price / 100).toFixed(2)} грн</td>
    </tr>
  `
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">Дякуємо за замовлення!</h1>
  </div>

  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Вітаємо, ${order.customerName}!</p>

    <p>Ваше замовлення <strong>#${order.number}</strong> успішно оформлено.</p>

    <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #667eea;">Деталі замовлення</h2>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Товар</th>
          <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Кількість</th>
          <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Ціна</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding: 12px 8px; font-weight: bold; font-size: 16px;">Разом:</td>
          <td style="padding: 12px 8px; text-align: right; font-weight: bold; font-size: 16px; color: #667eea;">${(order.total / 100).toFixed(2)} грн</td>
        </tr>
      </tfoot>
    </table>

    <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #667eea;">Доставка</h2>
    <p style="margin: 5px 0;"><strong>Місто:</strong> ${order.city}</p>
    <p style="margin: 5px 0;"><strong>Відділення:</strong> ${order.npBranch}</p>

    <div style="background: #f0f9ff; border-left: 4px solid #667eea; padding: 15px; margin-top: 30px; border-radius: 4px;">
      <p style="margin: 0; font-size: 14px;">Ми зв'яжемося з вами найближчим часом для підтвердження замовлення та уточнення деталей доставки.</p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">З повагою, команда YComp</p>
      <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #667eea; text-decoration: none;">ycomp.ua</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: order.email,
    subject: `Замовлення #${order.number} оформлено`,
    html,
  });
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(
  email: string,
  order: {
    number: string;
    status: string;
    trackingNumber?: string;
  }
) {
  const statusText: Record<string, string> = {
    NEW: "Новий",
    CONFIRMED: "Підтверджено",
    PROCESSING: "В обробці",
    SHIPPED: "Відправлено",
    DELIVERED: "Доставлено",
    CANCELLED: "Скасовано",
  };

  const statusColor: Record<string, string> = {
    NEW: "#3b82f6",
    CONFIRMED: "#10b981",
    PROCESSING: "#f59e0b",
    SHIPPED: "#8b5cf6",
    DELIVERED: "#059669",
    CANCELLED: "#ef4444",
  };

  let trackingHtml = "";
  if (order.trackingNumber) {
    trackingHtml = `
      <div style="background: #f0f9ff; border-left: 4px solid #667eea; padding: 15px; margin-top: 20px; border-radius: 4px;">
        <p style="margin: 0 0 10px 0; font-weight: bold;">Номер ТТН:</p>
        <p style="margin: 0; font-size: 18px; font-family: monospace;">${order.trackingNumber}</p>
        <p style="margin: 15px 0 0 0;">
          <a href="https://novaposhta.ua/tracking/?cargo_number=${order.trackingNumber}"
             style="display: inline-block; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Відстежити посилку
          </a>
        </p>
      </div>
    `;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px;">
    <h1 style="font-size: 24px; margin-bottom: 20px; color: #1f2937;">Оновлення статусу замовлення</h1>

    <p style="font-size: 16px;">Замовлення <strong>#${order.number}</strong></p>

    <div style="background: ${statusColor[order.status] || "#6b7280"}; color: white; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
      <p style="margin: 0; font-size: 18px; font-weight: bold;">${statusText[order.status] || order.status}</p>
    </div>

    ${trackingHtml}

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">З повагою, команда YComp</p>
      <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #667eea; text-decoration: none;">ycomp.ua</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: `Замовлення #${order.number}: ${statusText[order.status] || order.status}`,
    html,
  });
}

/**
 * Send promotional email
 */
export async function sendPromoEmail(
  email: string,
  promo: {
    title: string;
    description: string;
    imageUrl?: string;
    ctaText?: string;
    ctaUrl?: string;
  }
) {
  const imageHtml = promo.imageUrl
    ? `<img src="${promo.imageUrl}" alt="${promo.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">`
    : "";

  const ctaHtml = promo.ctaText && promo.ctaUrl
    ? `
      <div style="text-align: center; margin-top: 30px;">
        <a href="${promo.ctaUrl}"
           style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          ${promo.ctaText}
        </a>
      </div>
    `
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px;">
    ${imageHtml}

    <h1 style="font-size: 24px; margin-bottom: 20px; color: #1f2937;">${promo.title}</h1>

    <p style="font-size: 16px; line-height: 1.8;">${promo.description}</p>

    ${ctaHtml}

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
        Ви отримали цей лист, тому що підписані на розсилку YComp
      </p>
      <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe" style="color: #6b7280; text-decoration: underline;">Відписатися</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return sendEmail({
    to: email,
    subject: promo.title,
    html,
  });
}
