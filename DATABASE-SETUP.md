# База даних — з нуля

Покрокова інструкція без конфліктів. Виконуй строго по порядку.

---

## Частина 1: Підготовка в Vercel (очистити старе)

### 1.1 Відключити старі інтеграції

1. Відкрий **vercel.com** → проект **ycomp-sri8**
2. Вкладка **Storage**
3. Якщо є бази (ycomp1 тощо) — клікни на кожну → **Settings** / ⋮ → **Disconnect** / **Remove**
4. Storage має бути порожнім

### 1.2 Видалити старий DATABASE_URL (якщо є)

1. Вкладка **Settings** → **Environment Variables**
2. Знайди `DATABASE_URL` → клік **Delete** (для всіх середовищ)
3. Якщо є `DIRECT_DATABASE_URL` — теж видали

---

## Частина 2: Створити базу в Neon

### 2.1 Новий проект

1. Відкрий **[console.neon.tech](https://console.neon.tech)**
2. Увійди (GitHub або email)
3. Кнопка **New Project**
4. **Project name:** `ycomp`
5. **Region:** EU Central ( Frankfurt ) — або близький до тебе
6. **Create project**

### 2.2 Скопіювати connection string

1. Після створення зʼявиться екран з підключенням
2. Виберіть **Connection string** (вкладка може називатись Connect / Connection details)
3. Обовʼязково вибери **Pooled connection** (host з `-pooler` в імені)
4. Скопіюй рядок — виглядає так:
   ```
   postgresql://user:password@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
5. Збережи його (Notepad, Notes — знадобиться наступного кроку)

---

## Частина 3: Підключити базу до Vercel

### 3.1 Додати змінну

1. **Vercel** → проект **ycomp-sri8** → **Settings** → **Environment Variables**
2. **Add New**
3. **Key:** `DATABASE_URL`
4. **Value:** встав connection string з Neon (п. 2.2)
5. **Environments:** постав всі три галочки:
   - Production  
   - Preview  
   - Development
6. **Save**

### 3.2 Перевірити

- У списку має бути лише один `DATABASE_URL` (без дублікатів)
- Натисни **Reveal** — перевір, що хост містить `-pooler` (pooled connection)

---

## Частина 4: Локальна перевірка (опційно)

1. У корені проекту створи `.env`:
2. Поклади один рядок:
   ```
   DATABASE_URL=postgresql://...   (скопіюй з Neon)
   ```
3. В терміналі:
   ```bash
   npx prisma migrate deploy
   node prisma/seed.mjs
   ```
4. Якщо все ок — зʼявиться адмін `admin@ycomp.ua` / `admin123`

---

## Частина 5: Деплой

1. **Vercel** → **Deployments**
2. Останній деплой → ⋮ → **Redeploy**
3. Дочекайся закінчення білду

Під час білду виконається `prisma migrate deploy` — таблиці створються в новій базі.

---

## Частина 6: Seed на проді (якщо потрібен)

Якщо seed не запускався при деплої:

### Варіант A: Через Vercel (якщо є скрипт)

У `package.json` вже є `"seed": "node prisma/seed.mjs"`. Vercel його не запускає автоматично — seed робиться вручну.

### Варіант B: Локально з prod DATABASE_URL

1. **Vercel** → Settings → Environment Variables
2. Скопіюй значення `DATABASE_URL` (Reveal → Copy)
3. Локально:
   ```bash
   DATABASE_URL="postgresql://..." node prisma/seed.mjs
   ```

### Варіант C: Тільки адмін через Neon SQL

1. Зареєструйся на сайті (акаунт створиться)
2. **Neon Console** → **SQL Editor**
3. Виконай:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'твій@email.com';
   ```

---

## Чекліст

- [ ] Storage порожній (старі інтеграції відключені)
- [ ] Немає старого DATABASE_URL
- [ ] Новий проєкт створений в Neon
- [ ] Connection string (pooled) скопійований
- [ ] DATABASE_URL додана в Vercel для всіх середовищ
- [ ] Redeploy виконано
- [ ] Seed виконано або права адміна видані вручну

---

## Якщо щось пішло не так

**Білд падає на migrate:**
- Перевір, що в connection string є `-pooler` (prisma.config.ts перетворить його для migrate автоматично)

**403 / P1002 / timeout:**
- Переконайся, що використовуєш pooled connection string, а не direct

**Роль не застосовується:**
- Переконайся, що зміни внесені в ту саму базу, що в DATABASE_URL (перевір host у Vercel env і в Neon)
