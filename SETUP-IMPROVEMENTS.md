# Setup Guide: Critical Improvements

Этот гайд описывает настройку критичных улучшений безопасности и производительности.

## 1. Upstash Redis для Rate Limiting

### Зачем?

In-memory rate limiting **не работает** в serverless окружении (Vercel). Каждый cold start сбрасывает счетчики, что позволяет обойти защиту от brute-force атак.

### Настройка

1. **Создать Upstash Redis базу**
   - Зарегистрируйтесь на https://console.upstash.com/
   - Create Database → выберите регион близкий к вашим пользователям
   - Скопируйте **REST API** credentials (не Redis URL!)

2. **Добавить environment variables**

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxx...
```

3. **В Vercel Dashboard**
   - Settings → Environment Variables
   - Добавьте обе переменные для Production, Preview, Development

4. **Проверить работу**

```bash
npm run dev
# В логах должно быть: "[rate-limit] ✓ Using Upstash Redis"
```

### Стоимость

- **Free tier**: 10,000 команд/день
- Для production: ~$0.20 за 100K команд

## 2. Zod Validation

### Что изменилось?

Все API endpoints теперь валидируют входные данные через Zod схемы:

- ✅ Type-safe валидация
- ✅ Автоматические error messages
- ✅ Защита от injection атак
- ✅ Валидация форматов (email, phone, URL)

### Примеры использования

```typescript
// src/lib/validation.ts содержит все схемы

// В API route:
import { validateRequest, loginSchema } from "@/lib/validation";

const validation = await validateRequest(request, loginSchema);
if (!validation.success) {
  return NextResponse.json({ error: validation.error }, { status: 400 });
}

const { email, password } = validation.data; // Type-safe!
```

### Добавление новых схем

```typescript
// src/lib/validation.ts
export const myNewSchema = z.object({
  field: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});
```

## 3. PostgreSQL Migration

### Зачем мигрировать?

SQLite не подходит для production:
- ❌ Файловая БД не работает в serverless
- ❌ Нет connection pooling
- ❌ Проблемы с конкурентным доступом

PostgreSQL решает эти проблемы.

### Быстрый старт

См. подробный гайд в `MIGRATION-GUIDE.md`

**TL;DR:**

1. Создать БД на Neon.tech (бесплатно)
2. Добавить `DATABASE_URL` и `DIRECT_DATABASE_URL`
3. `npx prisma migrate deploy`
4. Deploy

## 4. Улучшенное логирование

### Prisma logging

Теперь логируются:
- `error` - ошибки БД
- `warn` - предупреждения
- `query` - все запросы (только в dev)

### Error handling

Все catch блоки теперь логируют ошибки в development для отладки.

## Проверка после настройки

### Checklist

- [ ] Upstash Redis настроен (проверить логи при старте)
- [ ] PostgreSQL подключен (запустить `npx prisma studio`)
- [ ] API валидация работает (попробовать отправить невалидные данные)
- [ ] Rate limiting работает (попробовать 6+ запросов на /api/auth/login)

### Тестирование rate limiting

```bash
# Должно вернуть 429 после 5 попыток
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done
```

### Тестирование валидации

```bash
# Должно вернуть 400 с описанием ошибки
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"123"}'
```

## Мониторинг в Production

### Upstash Dashboard

- Requests per second
- Latency
- Error rate

### Sentry (если настроен)

- Validation errors
- Database errors
- Rate limit hits

### Vercel Logs

```bash
vercel logs --follow
```

Ищите:
- `[rate-limit]` - статус rate limiting
- `[security]` - security events
- `[api]` - API requests

## Следующие шаги

После настройки критичных улучшений рекомендуется:

1. **E2E тесты** - Playwright для checkout flow
2. **Strict TypeScript** - включить `"strict": true`
3. **Pre-commit hooks** - husky + lint-staged
4. **API documentation** - OpenAPI/Swagger
5. **Кеширование** - Redis cache для каталога

## Troubleshooting

### Rate limiting не работает

```bash
# Проверить переменные окружения
echo $UPSTASH_REDIS_REST_URL
echo $UPSTASH_REDIS_REST_TOKEN

# Проверить логи
npm run dev | grep "rate-limit"
```

### Validation ошибки

Проверьте что схема соответствует вашим требованиям в `src/lib/validation.ts`

### PostgreSQL connection errors

- Проверьте IP whitelist в Neon/Supabase
- Используйте pooled URL для `DATABASE_URL`
- Используйте direct URL для `DIRECT_DATABASE_URL`

## Поддержка

Если возникли проблемы:
1. Проверьте логи: `npm run dev`
2. Проверьте environment variables
3. Создайте issue в репозитории
