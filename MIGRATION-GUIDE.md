# PostgreSQL Migration Guide

## Почему мигрировать с SQLite на PostgreSQL?

SQLite не подходит для production в serverless окружении:
- Файловая БД не работает в read-only filesystem (Vercel)
- Проблемы с конкурентным доступом
- Нет масштабирования

PostgreSQL решает эти проблемы и добавляет:
- Connection pooling (pgBouncer)
- Полнотекстовый поиск
- JSON операторы
- Репликация и бэкапы

## Шаг 1: Создать PostgreSQL базу данных

### Вариант A: Neon (рекомендуется)

1. Зарегистрируйтесь на https://neon.tech
2. Создайте новый проект
3. Скопируйте connection strings:
   - **Pooled connection** (для приложения) → `DATABASE_URL`
   - **Direct connection** (для миграций) → `DIRECT_DATABASE_URL`

```bash
# Пример
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```

### Вариант B: Supabase

1. Зарегистрируйтесь на https://supabase.com
2. Создайте новый проект
3. Settings → Database → Connection string
   - **Connection pooling** → `DATABASE_URL`
   - **Direct connection** → `DIRECT_DATABASE_URL`

### Вариант C: Vercel Postgres

```bash
vercel postgres create
```

## Шаг 2: Обновить environment variables

Добавьте в `.env.local`:

```bash
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
```

В Vercel Dashboard → Settings → Environment Variables добавьте обе переменные.

## Шаг 3: Запустить миграции

```bash
# Сгенерировать Prisma Client для PostgreSQL
npx prisma generate

# Применить миграции
npx prisma migrate deploy

# Или создать новую миграцию (если схема изменилась)
npx prisma migrate dev --name init_postgresql
```

## Шаг 4: Перенести данные (опционально)

Если у вас есть данные в SQLite:

```bash
# 1. Экспортировать данные из SQLite
npx prisma db pull --schema=prisma/schema.sqlite.prisma

# 2. Создать seed скрипт для переноса
node prisma/migrate-data.mjs
```

## Шаг 5: Проверить работу

```bash
# Запустить dev сервер
npm run dev

# Проверить подключение к БД
npx prisma studio
```

## Шаг 6: Deploy

```bash
git add .
git commit -m "feat: migrate to PostgreSQL"
git push

# Vercel автоматически запустит миграции через vercel-build
```

## Troubleshooting

### Ошибка: "Can't reach database server"

- Проверьте что IP адрес разрешен в настройках БД
- Для Neon: Settings → IP Allow → Add 0.0.0.0/0 (для Vercel)

### Ошибка: "Too many connections"

- Используйте pooled connection URL в `DATABASE_URL`
- Проверьте что `pgbouncer=true` в connection string

### Медленные запросы

```sql
-- Добавить индексы для часто используемых полей
CREATE INDEX idx_products_category ON "Product"("categoryId");
CREATE INDEX idx_products_popularity ON "Product"("popularity" DESC);
CREATE INDEX idx_orders_status ON "Order"("status");
```

## Rollback план

Если что-то пошло не так:

1. Вернуть `provider = "sqlite"` в schema.prisma
2. Восстановить `DATABASE_URL=file:./dev.db`
3. `npx prisma generate`
4. `git revert` и redeploy

## Оптимизация после миграции

1. **Connection pooling**: уже настроен через pgBouncer
2. **Индексы**: добавлены в schema.prisma
3. **Мониторинг**: используйте Neon/Supabase dashboard для query analytics
4. **Бэкапы**: автоматические в Neon/Supabase

## Стоимость

- **Neon Free tier**: 0.5 GB storage, 191 часов compute/месяц
- **Supabase Free tier**: 500 MB storage, 2 GB transfer
- **Vercel Postgres**: $0.30/GB storage + compute

Для production рекомендуется платный план с автоматическими бэкапами.
