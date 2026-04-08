# 🚀 Deployment Guide - YComp

Полное руководство по деплою проекта на Vercel.

## 📋 Предварительные требования

### 1. Аккаунты и сервисы

Создайте аккаунты в следующих сервисах:

- ✅ [Vercel](https://vercel.com) - хостинг Next.js приложения
- ✅ [Neon](https://neon.tech) или [Supabase](https://supabase.com) - PostgreSQL база данных
- ✅ [Upstash](https://upstash.com) - Redis для rate limiting
- ✅ [Nova Poshta](https://novaposhta.ua) - API для доставки
- ✅ [Telegram BotFather](https://t.me/BotFather) - создание бота
- ✅ [SendGrid](https://sendgrid.com) - email уведомления
- ✅ [Turbosms](https://turbosms.ua) - SMS уведомления

### 2. Подготовка репозитория

```bash
# Убедитесь что все изменения закоммичены
git status

# Создайте репозиторий на GitHub (если еще не создан)
git remote add origin https://github.com/YOUR_USERNAME/ycomp.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Шаг 1: Настройка базы данных (Neon)

### 1.1 Создание проекта

1. Перейдите на [console.neon.tech](https://console.neon.tech)
2. Нажмите **New Project**
3. Выберите регион: **Europe (Frankfurt)** для минимальной задержки
4. Скопируйте **Connection String**

### 1.2 Получение URL подключений

Neon предоставляет два типа URL:

**Pooled connection** (для приложения):
```
postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true
```

**Direct connection** (для миграций):
```
postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

Сохраните оба URL - они понадобятся для Vercel.

---

## 🔴 Шаг 2: Настройка Redis (Upstash)

1. Перейдите на [console.upstash.com](https://console.upstash.com)
2. Нажмите **Create Database**
3. Выберите:
   - **Name**: ycomp-redis
   - **Region**: Europe (Frankfurt)
   - **Type**: Regional (бесплатно до 10K команд/день)
4. После создания скопируйте:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 📦 Шаг 3: Деплой на Vercel

### 3.1 Подключение репозитория

1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **Add New** → **Project**
3. Импортируйте ваш GitHub репозиторий
4. Выберите **Framework Preset**: Next.js

### 3.2 Настройка Environment Variables

В разделе **Environment Variables** добавьте:

#### Обязательные переменные

```bash
# Database
DATABASE_URL=postgresql://user:password@host/db?pgbouncer=true
DIRECT_DATABASE_URL=postgresql://user:password@host/db

# JWT Secret (сгенерируйте: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

#### Redis (обязательно для production)

```bash
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxx
```

#### Nova Poshta (для доставки)

```bash
NP_API_KEY=your-nova-poshta-api-key
NP_SENDER_REF=your-sender-ref-from-cabinet
NP_SENDER_PHONE=+380XXXXXXXXX
```

#### Telegram Bot (для уведомлений)

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_ADMIN_CHAT_ID=123456789
```

#### SendGrid (email уведомления)

```bash
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

#### Turbosms (SMS уведомления)

```bash
TURBOSMS_LOGIN=your-login
TURBOSMS_PASSWORD=your-password
TURBOSMS_SENDER=YComp
```

### 3.3 Build Settings

Vercel автоматически определит настройки, но убедитесь:

- **Build Command**: `prisma generate && next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3.4 Запуск деплоя

1. Нажмите **Deploy**
2. Дождитесь завершения (2-3 минуты)
3. Проверьте логи на наличие ошибок

---

## 🔧 Шаг 4: Миграция базы данных

После успешного деплоя выполните миграции:

### Вариант 1: Через Vercel CLI (рекомендуется)

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Подключитесь к проекту
vercel link

# Выполните миграции
vercel env pull .env.production
npx prisma migrate deploy
```

### Вариант 2: Локально с production URL

```bash
# Создайте .env.production с DATABASE_URL из Vercel
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Вариант 3: Через Vercel Serverless Function

Создайте временный endpoint для миграций (удалите после использования):

```typescript
// src/app/api/migrate/route.ts
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== process.env.MIGRATION_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Выполните миграции вручную или используйте prisma.$executeRaw
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## 🌐 Шаг 5: Настройка домена (опционально)

### 5.1 Добавление кастомного домена

1. В Vercel перейдите в **Settings** → **Domains**
2. Добавьте ваш домен: `ycomp.ua`
3. Настройте DNS записи у вашего регистратора:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.2 Обновление переменных

После добавления домена обновите:

```bash
NEXT_PUBLIC_SITE_URL=https://ycomp.ua
SENDGRID_FROM_EMAIL=noreply@ycomp.ua
```

---

## 🔔 Шаг 6: Настройка интеграций

### 6.1 Telegram Webhook

После деплоя настройте webhook для бота:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.vercel.app/api/telegram/webhook"}'
```

Проверьте статус:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### 6.2 SendGrid Domain Authentication

1. Перейдите в SendGrid → **Settings** → **Sender Authentication**
2. Выберите **Authenticate Your Domain**
3. Добавьте DNS записи в ваш домен
4. Дождитесь верификации (до 48 часов)

### 6.3 Nova Poshta API Key

1. Войдите в [my.novaposhta.ua](https://my.novaposhta.ua)
2. Перейдите в **Настройки** → **Безопасность**
3. Сгенерируйте API ключ
4. Скопируйте `NP_SENDER_REF` из раздела **Отправители**

---

## ✅ Шаг 7: Проверка деплоя

### 7.1 Smoke tests

```bash
# Проверьте основные endpoints
curl https://your-domain.vercel.app/api/health
curl https://your-domain.vercel.app/api/categories

# Проверьте главную страницу
curl -I https://your-domain.vercel.app
```

### 7.2 Функциональные проверки

- ✅ Главная страница загружается
- ✅ Каталог товаров работает
- ✅ Поиск функционирует
- ✅ Карточка товара открывается
- ✅ Корзина добавляет товары
- ✅ Checkout форма работает
- ✅ Админ-панель доступна (только для админов)

### 7.3 Интеграции

- ✅ Telegram бот отвечает на команды
- ✅ Email уведомления приходят
- ✅ SMS отправляются
- ✅ Nova Poshta API работает

---

## 🔐 Шаг 8: Безопасность

### 8.1 Создание первого админа

```bash
# Подключитесь к production БД
DATABASE_URL="postgresql://..." npx prisma studio

# Или через SQL
psql $DATABASE_URL -c "UPDATE \"User\" SET role='ADMIN' WHERE email='your@email.com';"
```

### 8.2 Настройка CORS (если нужно)

В `next.config.ts` уже настроены security headers. Проверьте:

```bash
curl -I https://your-domain.vercel.app | grep -E "X-Frame-Options|X-Content-Type-Options"
```

### 8.3 Rate Limiting

Убедитесь что Upstash Redis работает:

```bash
# Сделайте несколько запросов подряд
for i in {1..10}; do curl https://your-domain.vercel.app/api/orders; done
```

После 5 запросов должна сработать блокировка.

---

## 📊 Шаг 9: Мониторинг

### 9.1 Vercel Analytics

1. В Vercel перейдите в **Analytics**
2. Включите **Web Analytics** (бесплатно)
3. Отслеживайте:
   - Page views
   - Unique visitors
   - Top pages
   - Referrers

### 9.2 Vercel Speed Insights

1. Включите **Speed Insights**
2. Мониторьте Core Web Vitals:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

### 9.3 Error Tracking (опционально)

Если добавили Sentry:

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=your-auth-token
```

---

## 🔄 Шаг 10: CI/CD

Vercel автоматически деплоит при push в main:

```bash
# Внесите изменения
git add .
git commit -m "feat: add new feature"
git push origin main

# Vercel автоматически:
# 1. Запустит build
# 2. Выполнит миграции (если настроено)
# 3. Задеплоит новую версию
# 4. Создаст preview URL
```

### Preview Deployments

Для каждого Pull Request Vercel создает preview URL:

```
https://ycomp-git-feature-branch-username.vercel.app
```

---

## 🐛 Troubleshooting

### Build Failed

**Ошибка**: `Prisma Client not generated`

```bash
# Решение: добавьте в package.json
"vercel-build": "prisma generate && next build"
```

**Ошибка**: `Module not found: Can't resolve '@/lib/...'`

```bash
# Проверьте tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Database Connection Failed

**Ошибка**: `Can't reach database server`

- Проверьте что DATABASE_URL правильный
- Убедитесь что используете pooled connection (с `?pgbouncer=true`)
- Проверьте что IP Vercel не заблокирован в Neon

### Rate Limiting Not Working

**Ошибка**: Rate limiting не срабатывает

- Проверьте что UPSTASH_REDIS_REST_URL и TOKEN установлены
- Убедитесь что Redis доступен из Vercel
- Проверьте логи: `vercel logs`

### Telegram Webhook Failed

**Ошибка**: Бот не отвечает

```bash
# Проверьте webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Переустановите webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://your-domain.vercel.app/api/telegram/webhook"
```

---

## 📝 Checklist перед production

- [ ] Все environment variables установлены
- [ ] База данных мигрирована
- [ ] Redis настроен и работает
- [ ] Telegram webhook установлен
- [ ] SendGrid domain authenticated
- [ ] Nova Poshta API key валидный
- [ ] Создан первый админ пользователь
- [ ] Smoke tests пройдены
- [ ] Security headers настроены
- [ ] Analytics включен
- [ ] Custom domain настроен (опционально)
- [ ] SSL сертификат активен
- [ ] Backup стратегия определена

---

## 🎉 Готово!

Ваш проект успешно задеплоен на Vercel!

**Production URL**: https://your-domain.vercel.app

### Полезные команды

```bash
# Просмотр логов
vercel logs

# Откат к предыдущей версии
vercel rollback

# Список деплоев
vercel ls

# Удаление деплоя
vercel rm deployment-url
```

### Полезные ссылки

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Console](https://console.neon.tech)
- [Upstash Console](https://console.upstash.com)
- [Vercel Documentation](https://vercel.com/docs)

---

**Дата создания**: 2026-04-07  
**Версия**: 1.0.0
