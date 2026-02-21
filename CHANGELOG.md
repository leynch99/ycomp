# Changelog

## 2026-02-21 — Search, Security, Smoke

### 1. Поиск: синхронизация фронт ↔ API

**`src/app/api/search/route.ts`**
- Возвращает `{ items: [...] }` (без suggestions/hints)
- Поиск по `name`, `sku`, `brand` (contains, insensitive)
- Сортировка: `popularity desc`, `createdAt desc`
- `take: 8`
- Поля: `id`, `name`, `slug`, `salePrice`, `image` (первая картинка)

### 2. SearchBar — визуал

**`src/components/SearchBar.tsx`**
- Thumbnail (next/image) в карточках результатов
- formatPrice для цен
- Loading-state (skeleton из 3 карточек)
- Empty-state: «Нічого не знайдено…»
- Карточки с hover (`hover:bg-[var(--lilac-50)]`)
- Заголовок dropdown: «Швидкий пошук»
- Placeholder: «Пошук товарів, брендів, SKU»
- Focus: `focus:border-[var(--lilac-500)] focus:ring-2 focus:ring-[var(--lilac-500)]/20`
- Debounce и логика открытия/закрытия сохранены

### 3. Security telemetry

**`src/lib/security-telemetry.ts`** (новый файл)
- `normalizeEmail`, `normalizePhone`
- `maskEmail`, `maskPhone` — маскирование PII в логах
- `emitSecurityEvent(name, payload)` → structured JSON в stdout

События: `rate_limit_block`, `auth_attempt`, `auth_success`, `order_validation_failed`, `order_created`.

### 4. Rate-limit + telemetry в API

**`src/app/api/auth/login/route.ts`**
- rate_limit по IP + email (уже было)
- emit `auth_attempt`, `auth_success`, `rate_limit_block` (masked PII)

**`src/app/api/auth/register/route.ts`**
- rate_limit по IP + email/phone (уже было)
- emit `auth_attempt`, `auth_success`, `rate_limit_block`

**`src/app/api/orders/route.ts`**
- rate_limit по IP + phone/email (уже было)
- emit `rate_limit_block`, `order_validation_failed`, `order_created`

### 5. Smoke API checks

**`scripts/smoke-api.mjs`** (Node.js, кросс-платформенно)
- `npx prisma generate`
- Запуск dev на порту `TEST_PORT` (по умолчанию 3001)
- Проверки:
  - login bad payload → 400 invalid
  - register bad phone → 400 phone_invalid
  - order empty items → 400 Empty order

**`scripts/smoke-api.sh`** — bash-вариант (Linux/macOS/Git Bash)

**`package.json`**
```json
"test:smoke-api": "node scripts/smoke-api.mjs"
```

### 6. Тесты

**`tests/api-smoke.test.mjs`**
- Ожидает `body.items` вместо `body.suggestions`/`body.products`

---

### Команды

| Команда | Описание |
|---------|----------|
| `npm run lint` | ESLint (есть pre-existing ошибки в других файлах) |
| `npm run test:smoke` | Node test (нужен запущенный dev) |
| `npm run test:smoke-api` | Smoke API: prisma generate, dev на 3001, 3 проверки |

### Окружение

- **Windows без bash**: использовать `npm run test:smoke-api` (Node-скрипт)
- **Lint**: 18 errors в других файлах (AccountClient, CatalogFilters, CheckoutForm, providers и т.д.) — не от этих изменений
