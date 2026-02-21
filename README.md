This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Performance / Core Web Vitals

### Budgets (LCP, CLS, INP)

| Метрика | Good | Needs improvement | Poor |
|---------|------|-------------------|------|
| **LCP** | ≤ 2.5 s | ≤ 4 s | > 4 s |
| **CLS** | ≤ 0.1 | ≤ 0.25 | > 0.25 |
| **INP** | ≤ 200 ms | ≤ 500 ms | > 500 ms |

### Імідж-стратегія

- **Hero** (banner на головній): `priority` — завантажується одразу
- **Product page main image**: `priority` + `sizes` — LCP на сторінці товару
- **ProductCard, tile banners**: `loading="lazy"` + `sizes` — підвантаження під скрол
- Контейнери з `aspect-square` + градієнт фоном мінімізують CLS

### Перевірка бюджетів

```bash
# Запустити dev сервер, потім в іншому терміналі:
npm run perf        # Lighthouse CI з assertions (LCP ≤2500, CLS ≤0.1)
npm run perf:lh     # Разовий звіт Lighthouse → lighthouse-report.html
```

### Моніторинг у проді

Web Vitals відправляються в реальному часі:

- **Google Analytics (GA4)** — якщо `NEXT_PUBLIC_GA_MEASUREMENT_ID` задано
- **`/api/web-vitals`** — логування в stdout (page, device, metric, value, rating)

Подальше: інтеграція з Logflare/Datadog або збереження в БД для аналітики по сторінках і девайсах.

## API-критичні тести (must-have)

Інтеграційні тести для зниження ризику регресій:

```bash
npm run dev      # в одному терміналі
npm run test:smoke   # в іншому (потребує seeded DB: npx prisma db seed)
```

**Покриття:**
- **auth/login** — валідні/невалідні креденшіали, 400 для порожніх полів
- **auth/register** — невалідний телефон, короткий пароль, дублікат email, успішна реєстрація
- **orders** — total рахується тільки з БД (ігнорує salePrice від клієнта)
- **admin** — 403 без auth, 403 для USER, 200 для ADMIN (GET /api/admin/banners)

## Observability (Наблюдаемость)

### SLI / SLO

| SLI | SLO | Метрика |
|-----|-----|---------|
| Доступність API | 99.5% | Успішні 2xx/3xx / загальна к-сть запитів |
| Латентність p95 | &lt; 500 ms | Час відповіді API |
| Error rate 5xx | &lt; 0.1% | 5xx / загальна к-сть |
| Rate limit 429 | Рідко | Через security_429 у логах |
| Доставка (NP/UP) | Fallback без простою | external_service success/fail |

### Структурні логи API

JSON-логи на stdout для всіх `/api/*` запитів:

```json
{"@timestamp":"...","level":"info","message":"api","requestId":"...","route":"/api/auth/login","method":"POST","status":200,"latencyMs":45,"ip":"..."}
```

- **requestId** — генерується в middleware, передається в заголовку `x-request-id`
- **route**, **method**, **status**, **latencyMs** — через `withApiLog()` на критичних роутах
- **external_service** — для NP/UP API: success, latencyMs, error (при fallback)

### Error tracking (Sentry)

При `NEXT_PUBLIC_SENTRY_DSN` та `SENTRY_DSN`:

- Необроблені помилки (5xx) → Sentry
- `captureRequestError` (instrumentation.ts) для серверних помилок
- `global-error.tsx` — React-помилки
- Ручний `captureException` в catch блоках (наприклад register)

### Алерти (рекомендації)

| Тип | Умова | Канал | Дія |
|-----|-------|-------|-----|
| **5xx** | &gt; 5 за 5 хв | Slack/Email | Перевірити Sentry, логи |
| **429** | security_429 у логах | Лог-агрегатор | Аналіз brute-force |
| **Доставка** | external_service success=false &gt; 50% за 15 хв | PagerDuty | Перевірити NP/UP API |

Для алертів використовуйте Vercel Log Drain, Datadog, Logflare або подібний агрегатор логів з фільтрами по `status`, `message`, `service`.
