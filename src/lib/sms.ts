/**
 * SMS notifications via Turbosms
 *
 * Setup:
 * 1. Register at https://turbosms.ua
 * 2. Get API credentials
 * 3. Set TURBOSMS_LOGIN and TURBOSMS_PASSWORD in .env
 * 4. Set TURBOSMS_SENDER (approved sender name)
 */

interface SmsOptions {
  phone: string;
  message: string;
}

/**
 * Send SMS via Turbosms API
 */
export async function sendSms(options: SmsOptions): Promise<boolean> {
  const login = process.env.TURBOSMS_LOGIN;
  const password = process.env.TURBOSMS_PASSWORD;
  const sender = process.env.TURBOSMS_SENDER || "YComp";

  if (!login || !password) {
    console.warn("[sms] TURBOSMS credentials not set, SMS notifications disabled");
    return false;
  }

  // Normalize phone: remove all non-digits, ensure starts with 380
  let phone = options.phone.replace(/\D/g, "");
  if (phone.startsWith("0")) {
    phone = "38" + phone;
  } else if (!phone.startsWith("380")) {
    phone = "380" + phone;
  }

  const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <soap:Body>
    <SendSMS xmlns="http://turbosms.in.ua/">
      <sender>${sender}</sender>
      <destination>${phone}</destination>
      <text>${options.message}</text>
    </SendSMS>
  </soap:Body>
</soap:Envelope>`;

  try {
    const response = await fetch("https://api.turbosms.ua/", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Authorization": "Basic " + Buffer.from(`${login}:${password}`).toString("base64"),
        "SOAPAction": "",
      },
      body: soapBody,
    });

    const text = await response.text();

    // Check for success in SOAP response
    if (text.includes("<SendSMSResult>") && !text.includes("INVALID")) {
      console.log(`[sms] Sent to ${phone}`);
      return true;
    }

    console.error("[sms] Failed to send:", text);
    return false;
  } catch (error) {
    console.error("[sms] Error sending SMS:", error);
    return false;
  }
}

/**
 * Send order confirmation SMS
 */
export async function sendOrderConfirmationSms(order: {
  number: string;
  phone: string;
  total: number;
}) {
  const message = `YComp: Zamovlennya #${order.number} oformleno. Suma: ${(order.total / 100).toFixed(0)} grn. Dzyakuyemo!`;

  return sendSms({
    phone: order.phone,
    message,
  });
}

/**
 * Send order shipped SMS with tracking
 */
export async function sendOrderShippedSms(order: {
  number: string;
  phone: string;
  trackingNumber: string;
}) {
  const message = `YComp: Zamovlennya #${order.number} vidpravleno. TTN: ${order.trackingNumber}. Vidstezhyty: novaposhta.ua`;

  return sendSms({
    phone: order.phone,
    message,
  });
}

/**
 * Send order delivered SMS
 */
export async function sendOrderDeliveredSms(order: {
  number: string;
  phone: string;
}) {
  const message = `YComp: Zamovlennya #${order.number} dostavleno. Dzyakuyemo za pokupku!`;

  return sendSms({
    phone: order.phone,
    message,
  });
}

/**
 * Send verification code SMS
 */
export async function sendVerificationCodeSms(phone: string, code: string) {
  const message = `YComp: Vash kod pidtverdzhennya: ${code}. Ne povidomlyayte nikomu.`;

  return sendSms({
    phone,
    message,
  });
}

/**
 * Send promotional SMS
 */
export async function sendPromoSms(phone: string, promo: string) {
  const message = `YComp: ${promo}. Detali: ycomp.ua`;

  return sendSms({
    phone,
    message,
  });
}
