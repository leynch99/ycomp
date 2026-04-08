import { NextResponse } from "next/server";
import { withApiLog } from "@/lib/api-with-logging";
import { sendTelegramMessage } from "@/lib/telegram";

/**
 * Telegram Bot Webhook
 *
 * Setup:
 * 1. Set webhook URL: https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram/webhook
 * 2. Bot will receive updates via this endpoint
 */

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
    };
    message: {
      message_id: number;
      chat: {
        id: number;
      };
    };
    data: string;
  };
}

async function telegramWebhookHandler(request: Request) {
  const update: TelegramUpdate = await request.json();

  // Handle text messages
  if (update.message?.text) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    const username = update.message.from.username || update.message.from.first_name;

    console.log(`[telegram] Message from ${username}: ${text}`);

    // Handle commands
    if (text.startsWith("/")) {
      return handleCommand(chatId, text, username);
    }

    // Echo back for now (can be extended with AI chatbot)
    await sendTelegramMessage({
      chat_id: chatId,
      text: `Дякуємо за повідомлення! Наш менеджер зв'яжеться з вами найближчим часом.\n\nВикористовуйте /help для списку команд.`,
    });
  }

  // Handle callback queries (button clicks)
  if (update.callback_query) {
    const callbackId = update.callback_query.id;
    const data = update.callback_query.data;
    const chatId = update.callback_query.message.chat.id;

    console.log(`[telegram] Callback from ${chatId}: ${data}`);

    // Handle callback data
    // Example: "track:TTN123456"
    if (data.startsWith("track:")) {
      const ttn = data.split(":")[1];
      await sendTelegramMessage({
        chat_id: chatId,
        text: `🔍 Відстежити посилку: https://novaposhta.ua/tracking/?cargo_number=${ttn}`,
      });
    }
  }

  return NextResponse.json({ ok: true });
}

async function handleCommand(chatId: number, command: string, username: string) {
  const cmd = command.split(" ")[0].toLowerCase();

  switch (cmd) {
    case "/start":
      await sendTelegramMessage({
        chat_id: chatId,
        text: `Вітаємо в YComp! 👋\n\nМи - інтернет-магазин комп'ютерних комплектуючих.\n\nВикористовуйте /help для списку команд.`,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🛒 Перейти на сайт", url: process.env.NEXT_PUBLIC_SITE_URL || "https://ycomp.ua" }],
            [{ text: "📞 Зв'язатися з нами", url: `${process.env.NEXT_PUBLIC_SITE_URL}/contacts` }],
          ],
        },
      });
      break;

    case "/help":
      await sendTelegramMessage({
        chat_id: chatId,
        text: `📋 Доступні команди:\n\n/start - Почати роботу з ботом\n/help - Показати це повідомлення\n/catalog - Переглянути каталог\n/deals - Акційні товари\n/track - Відстежити замовлення\n/contact - Зв'язатися з нами\n\nПросто напишіть нам, і ми відповімо!`,
      });
      break;

    case "/catalog":
      await sendTelegramMessage({
        chat_id: chatId,
        text: "🛒 Наш каталог:",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Процесори", url: `${process.env.NEXT_PUBLIC_SITE_URL}/c/processors` }],
            [{ text: "Відеокарти", url: `${process.env.NEXT_PUBLIC_SITE_URL}/c/graphics-cards` }],
            [{ text: "Материнські плати", url: `${process.env.NEXT_PUBLIC_SITE_URL}/c/motherboards` }],
            [{ text: "Оперативна пам'ять", url: `${process.env.NEXT_PUBLIC_SITE_URL}/c/ram` }],
            [{ text: "Весь каталог", url: `${process.env.NEXT_PUBLIC_SITE_URL}/catalog` }],
          ],
        },
      });
      break;

    case "/deals":
      await sendTelegramMessage({
        chat_id: chatId,
        text: "🎉 Акційні товари:",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Переглянути акції", url: `${process.env.NEXT_PUBLIC_SITE_URL}/deals` }],
          ],
        },
      });
      break;

    case "/track":
      await sendTelegramMessage({
        chat_id: chatId,
        text: "📦 Для відстеження замовлення введіть номер ТТН або номер замовлення.\n\nНаприклад: YC-123456 або 59001234567890",
      });
      break;

    case "/contact":
      await sendTelegramMessage({
        chat_id: chatId,
        text: "📞 Зв'язатися з нами:",
        reply_markup: {
          inline_keyboard: [
            [{ text: "Форма зворотнього зв'язку", url: `${process.env.NEXT_PUBLIC_SITE_URL}/contacts` }],
            [{ text: "Телефон", url: "tel:+380123456789" }],
          ],
        },
      });
      break;

    default:
      await sendTelegramMessage({
        chat_id: chatId,
        text: "❓ Невідома команда. Використовуйте /help для списку команд.",
      });
  }

  return NextResponse.json({ ok: true });
}

export const POST = withApiLog(telegramWebhookHandler);
