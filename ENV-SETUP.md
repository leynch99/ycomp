# Налаштування змінних середовища

## Vercel (зараз)

1. Відкрий [vercel.com](https://vercel.com) → проєкт **ycomp**
2. **Settings** → **Environment Variables**
3. Додай змінні:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SITE_URL` | `https://ycomp.ua` | Production, Preview |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Production, Preview |
| `BLOB_READ_WRITE_TOKEN` | *(авто)* | Production, Preview |

**Blob для завантаження фото:** Vercel → **Storage** → **Create Database** → обрати **Blob** → створити. Токен `BLOB_READ_WRITE_TOKEN` зʼявиться автоматично.

**Як отримати GA Measurement ID:**
- [analytics.google.com](https://analytics.google.com) → Admin → Data Streams
- Обери потік (або створи) → скопіюй **Measurement ID** (формат `G-XXXXXXXXXX`)

4. Після збереження — **Redeploy** останнього деплою (Deployments → ⋮ → Redeploy)

---

## Повноцінний сервер (VPS, Dedicated тощо)

Коли переїжджаєш на свій сервер (DigitalOcean, Hetzner, AWS і т.д.):

### 1. Файл `.env` у корені проєкту

```bash
# На сервері в папці з проєктом
nano .env
```

Вміст:

```
NEXT_PUBLIC_SITE_URL=https://ycomp.ua
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
DATABASE_URL=postgresql://...
JWT_SECRET=твій-секретний-ключ
```

Збережи і перезапусти сервер/процес (наприклад, `pm2 restart` або `systemctl restart ycomp`).

### 2. systemd (якщо запускаєш через systemd)

```ini
# /etc/systemd/system/ycomp.service
[Service]
Environment="NEXT_PUBLIC_SITE_URL=https://ycomp.ua"
Environment="NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX"
EnvironmentFile=/home/user/ycomp/.env
```

### 3. Docker

```yaml
# docker-compose.yml
services:
  app:
    environment:
      - NEXT_PUBLIC_SITE_URL=https://ycomp.ua
      - NEXT_PUBLIC_GA_MEASUREMENT_ID=${GA_ID}
    env_file: .env
```

Або передай через `-e` при запуску контейнера.

### 4. Панелі хостингу (cPanel, Plesk тощо)

Зазвичай є розділ **Environment Variables** або **Application Settings** — там задаються ті самі змінні.

---

## Як змінити пізніше

| Де зараз | Як змінити |
|----------|------------|
| **Vercel** | Settings → Environment Variables → Edit → Save → Redeploy |
| **Сервер + .env** | Редагуй `.env`, перезапусти додаток |
| **Docker** | Зміни `docker-compose.yml` або `.env`, потім `docker-compose up -d` |
| **systemd** | Редагуй `.service` або `EnvironmentFile`, потім `systemctl daemon-reload && systemctl restart ycomp` |

**Важливо:** `NEXT_PUBLIC_*` змінні потрапляють у клієнтський JS при збірці. Після їх зміни потрібна **нова збірка** (`npm run build`) і перезапуск. На Vercel це автоматично при Redeploy.
