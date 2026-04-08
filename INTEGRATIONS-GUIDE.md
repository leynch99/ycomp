# 🔌 Интеграции YComp

Руководство по настройке всех интеграций проекта.

## 📋 Содержание

1. [Telegram Bot](#telegram-bot)
2. [Email уведомления (SendGrid)](#email-уведомления)
3. [SMS уведомления (Turbosms)](#sms-уведомления)
4. [Новая Почта API](#новая-почта-api)
5. [Тестирование](#тестирование)

---

## 📱 Telegram Bot

### Возможности

- ✅ Уведомления админа о новых заказах
- ✅ Уведомления клиентов о статусе заказа
- ✅ Команды для клиентов (/start, /help, /catalog, /track)
- ✅ Webhook для получения сообщений
- ✅ Inline кнопки для быстрых действий

### Настройка

**1. Создать бота**

```bash
# Открыть @BotFather в Telegram
# Отправить команду:
/newbot

# Следовать инструкциям, получить токен
```

**2. Добавить переменные окружения**

```bash
# .env.local
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ADMIN_CHAT_ID=123456789
```

**Как получить ADMIN_CHAT_ID:**
1. Написать боту любое сообщение
2. Открыть: `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Найти `"chat":{"id":123456789}`

**3. Настроить webhook (для production)**

```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram/webhook"
```

**Для development:** Webhook не нужен, уведомления работают через прямые API вызовы.

### Использование

```typescript
import { notifyAdminNewOrder, sendPromoMessage } from "@/lib/telegram";

// Уведомить админа о заказе
await notifyAdminNewOrder({
  number: "YC-123456",
  customerName: "Іван Петренко",
  phone: "+380123456789",
  total: 50000, // в копейках
  itemCount: 3,
});

// Отправить промо клиенту
await sendPromoMessage("123456789", {
  title: "Знижка 20% на відеокарти!",
  description: "Тільки до кінця тижня",
  url: "https://ycomp.ua/deals",
});
```

### Команды бота

- `/start` - Приветствие и основные кнопки
- `/help` - Список команд
- `/catalog` - Каталог товаров
- `/deals` - Акции
- `/track` - Отследить заказ
- `/contact` - Контакты

---

## 📧 Email уведомления

### Возможности

- ✅ Подтверждение заказа с деталями
- ✅ Обновление статуса заказа
- ✅ Промо-рассылки
- ✅ Красивые HTML шаблоны
- ✅ Автоматическая отписка

### Настройка

**1. Создать аккаунт SendGrid**

1. Зарегистрироваться: https://sendgrid.com
2. Verify sender email (Settings → Sender Authentication)
3. Создать API Key (Settings → API Keys) с правами "Mail Send"

**2. Добавить переменные окружения**

```bash
# .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@ycomp.ua
```

**3. Verify домен (опционально, для production)**

Settings → Sender Authentication → Authenticate Your Domain

### Использование

```typescript
import { sendOrderConfirmationEmail, sendPromoEmail } from "@/lib/email";

// Подтверждение заказа
await sendOrderConfirmationEmail({
  number: "YC-123456",
  customerName: "Іван Петренко",
  email: "ivan@example.com",
  total: 50000,
  items: [
    { name: "RTX 4070", qty: 1, price: 35000 },
    { name: "Ryzen 7 5800X", qty: 1, price: 15000 },
  ],
  city: "Київ",
  npBranch: "Відділення №1",
});

// Промо-рассылка
await sendPromoEmail("customer@example.com", {
  title: "Знижка 20% на відеокарти!",
  description: "Встигніть придбати до кінця тижня",
  imageUrl: "https://example.com/promo.jpg",
  ctaText: "Переглянути акції",
  ctaUrl: "https://ycomp.ua/deals",
});
```

### Шаблоны

Все шаблоны находятся в `src/lib/email.ts` и используют inline CSS для совместимости с email клиентами.

---

## 📱 SMS уведомления

### Возможности

- ✅ Подтверждение заказа
- ✅ Уведомление об отправке с ТТН
- ✅ Уведомление о доставке
- ✅ Коды верификации
- ✅ Промо-рассылки

### Настройка

**1. Создать аккаунт Turbosms**

1. Зарегистрироваться: https://turbosms.ua
2. Пополнить баланс
3. Зарегистрировать имя отправителя (Settings → Sender Names)

**2. Добавить переменные окружения**

```bash
# .env.local
TURBOSMS_LOGIN=your_login
TURBOSMS_PASSWORD=your_password
TURBOSMS_SENDER=YComp
```

### Использование

```typescript
import { sendOrderConfirmationSms, sendOrderShippedSms } from "@/lib/sms";

// Подтверждение заказа
await sendOrderConfirmationSms({
  number: "YC-123456",
  phone: "+380123456789",
  total: 50000,
});

// Отправка с ТТН
await sendOrderShippedSms({
  number: "YC-123456",
  phone: "+380123456789",
  trackingNumber: "59001234567890",
});
```

### Ограничения

- Максимум 160 символов (кириллица - 70)
- Используется транслитерация для экономии символов
- Стоимость: ~0.50 грн за SMS

---

## 📦 Новая Почта API

### Возможности

- ✅ Поиск городов
- ✅ Получение отделений
- ✅ **Создание ТТН автоматически**
- ✅ **Отслеживание посылок**
- ✅ Расчет стоимости доставки
- ✅ Расчет времени доставки
- ✅ Fallback на локальную БД

### Настройка

**1. Получить API ключ**

1. Зарегистрироваться: https://novaposhta.ua
2. Личный кабинет → Настройки → Безопасность → API ключ

**2. Получить Sender Ref**

1. Личный кабинет → Контрагенты
2. Скопировать Ref вашего контрагента

**3. Добавить переменные окружения**

```bash
# .env.local
NP_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NP_SENDER_REF=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NP_SENDER_PHONE=+380123456789
```

### Использование

#### Создание ТТН

```typescript
import { createExpressWaybill } from "@/lib/novaposhta";

const ttn = await createExpressWaybill({
  senderRef: process.env.NP_SENDER_REF!,
  senderCityRef: "db5c88f0-391c-11dd-90d9-001a92567626", // Київ
  senderWarehouseRef: "1ec09d88-e1c2-11e3-8c4a-0050568002cf",
  recipientName: "Іван Петренко",
  recipientPhone: "+380123456789",
  recipientCityRef: "db5c88f0-391c-11dd-90d9-001a92567626",
  recipientWarehouseRef: "511fcfba-e1c2-11e3-8c4a-0050568002cf",
  paymentMethod: "Cash",
  cost: 500, // UAH
  weight: 2, // kg
  seatsAmount: 1,
  description: "RTX 4070 x1, Ryzen 7 5800X x1",
});

console.log(ttn.trackingNumber); // "59001234567890"
```

#### Отслеживание посылки

```typescript
import { trackParcel } from "@/lib/novaposhta";

const tracking = await trackParcel("59001234567890");

console.log(tracking.status); // "Прибув у відділення"
console.log(tracking.warehouse); // "Відділення №1"
```

#### API endpoints

**Создать ТТН для заказа:**
```bash
POST /api/admin/orders/:id/create-ttn
{
  "senderCityRef": "...",
  "senderWarehouseRef": "...",
  "recipientCityRef": "...",
  "recipientWarehouseRef": "...",
  "weight": 2,
  "seatsAmount": 1
}
```

**Отследить посылку:**
```bash
GET /api/tracking?ttn=59001234567890
```

---

## 🧪 Тестирование

### Telegram Bot

```bash
# 1. Отправить тестовое уведомление
curl -X POST http://localhost:3000/api/test/telegram \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification"}'

# 2. Проверить webhook (в production)
curl https://yourdomain.com/api/telegram/webhook
```

### Email

```bash
# Отправить тестовый email
curl -X POST http://localhost:3000/api/test/email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Test", "html": "<h1>Test</h1>"}'
```

### SMS

```bash
# Отправить тестовый SMS
curl -X POST http://localhost:3000/api/test/sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+380123456789", "message": "Test SMS"}'
```

### Nova Poshta

```bash
# Поиск городов
curl "http://localhost:3000/api/delivery/np/cities?q=Київ"

# Получить отделения
curl "http://localhost:3000/api/delivery/np/branches?cityRef=db5c88f0-391c-11dd-90d9-001a92567626"

# Отследить посылку
curl "http://localhost:3000/api/tracking?ttn=59001234567890"
```

---

## 📊 Мониторинг

### Логи

Все интеграции логируют свои действия:

```bash
# Development
npm run dev | grep "\[telegram\]"
npm run dev | grep "\[email\]"
npm run dev | grep "\[sms\]"
npm run dev | grep "\[novaposhta\]"

# Production (Vercel)
vercel logs --follow
```

### Метрики

- **Telegram**: Проверить статус бота - `https://api.telegram.org/bot<TOKEN>/getMe`
- **SendGrid**: Dashboard → Activity
- **Turbosms**: Личный кабинет → Статистика
- **Nova Poshta**: Личный кабинет → История запросов

---

## 💰 Стоимость

| Сервис | Free tier | Платный план |
|--------|-----------|--------------|
| **Telegram** | Бесплатно | Бесплатно |
| **SendGrid** | 100 emails/день | $19.95/мес (50K emails) |
| **Turbosms** | - | ~0.50 грн/SMS |
| **Nova Poshta** | Бесплатно | Бесплатно |

---

## 🔒 Безопасность

### Важно

- ✅ Все API ключи в `.env`, не в коде
- ✅ Telegram webhook использует HTTPS
- ✅ Rate limiting на всех endpoints
- ✅ Валидация всех входных данных
- ✅ Логирование всех действий

### Рекомендации

1. Используйте разные API ключи для dev/prod
2. Регулярно ротируйте ключи
3. Мониторьте использование API
4. Настройте алерты на превышение лимитов

---

## 🐛 Troubleshooting

### Telegram не отправляет сообщения

```bash
# Проверить токен
curl https://api.telegram.org/bot<TOKEN>/getMe

# Проверить chat ID
curl https://api.telegram.org/bot<TOKEN>/getUpdates
```

### SendGrid не отправляет email

1. Проверить API key в dashboard
2. Verify sender email
3. Проверить логи: SendGrid → Activity

### Turbosms не отправляет SMS

1. Проверить баланс
2. Проверить имя отправителя (должно быть зарегистрировано)
3. Проверить формат телефона (+380XXXXXXXXX)

### Nova Poshta API ошибки

1. Проверить API key
2. Проверить Sender Ref
3. Проверить формат данных (Ref должны быть UUID)

---

## 📚 Дополнительно

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [Turbosms API](https://turbosms.ua/api.html)
- [Nova Poshta API](https://devcenter.novaposhta.ua/)

---

**Создано:** 2026-04-07  
**Версия:** 1.0.0
