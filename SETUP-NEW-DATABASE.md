# Нова база даних — покроковий гайд

## Крок 1: Видалити стару інтеграцію в Vercel

1. **Vercel** → проєкт **ycomp-sri8** → вкладка **Storage**
2. Клікни на **ycomp1** (Neon)
3. Відкрий **Settings** або ⋮ меню → **Disconnect** / **Remove**
4. Підтверди видалення

> Це видалить `DATABASE_URL` з env-змінних. Потім додамо нову.

---

## Крок 2: Створити нову базу в Neon

1. Перейди на [console.neon.tech](https://console.neon.tech)
2. **New Project** → назва, наприклад **ycomp2**
3. Region — обери близький (наприклад EU Central)
4. **Create project**
5. Після створення — зʼявиться **Connection string**. Скопіюй його (потрібен буде для перевірки)

---

## Крок 3: Підключити нову базу до Vercel

1. **Vercel** → Storage → **Connect Database**
2. Обери **Neon** у списку
3. Обери створений проєкт **ycomp2** (або той, що створив)
4. **Custom prefix** → впиши `DATABASE`
5. Environments → постав галочки **Production**, **Preview**, **Development**
6. **Connect**

Після цього зʼявиться змінна `DATABASE_URL` з новим connection string.

---

## Крок 4: Міграції та seed локально (опційно)

Якщо хочеш перевірити до деплою:

```bash
# У .env вкажи DATABASE_URL від нової бази (скопіюй з Vercel → Settings → Env)
npm run vercel-build
```

Або поетапно:

```bash
npx prisma generate
npx prisma migrate deploy
node prisma/seed.mjs
```

---

## Крок 5: Redeploy на Vercel

1. **Deployments** → останній деплой → ⋮ → **Redeploy**
2. Або зміни щось у коді й зроби `git push`

Білд виконає `prisma migrate deploy` автоматично і створить таблиці в новій базі.

---

## Крок 6: Адмін

Після seed — логін: `admin@ycomp.ua` / `admin123`

Якщо seed не робив — видай права вручну в Neon SQL Editor:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'твій@email.com';
```
