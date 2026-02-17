# Почему Vercel не деплоит автоматически

## 1. Email автора коммита

Vercel привязывает деплой к аккаунту GitHub. Если `git config user.email` не совпадает с email в твоём GitHub — деплой может не запускаться.

**Проверить:**
```bash
git config user.email
git log -1 --format="%ae"
```

**Исправить** (подставь email от GitHub):
```bash
git config --global user.email "твой@email.com"
git config --global user.name "твой GitHub username"
```

Если последний коммит уже с неправильным автором — сделай пустой коммит и push:
```bash
git commit --allow-empty -m "Trigger deploy"
git push origin main
```

## 2. Подключение к GitHub

1. Зайди на [vercel.com](https://vercel.com) → твой проект
2. **Settings** → **Git** — проверь, что репозиторий `leynch99/ycomp` подключён
3. [Account Settings](https://vercel.com/account) → **Authentication** — проверь связь с GitHub

## 3. Ручной деплой

**Вариант А — из Vercel Dashboard:**
- Проект → **Deployments** → кнопка **Redeploy** у последнего деплоя  
- Или **Deploy** → **Deploy with existing Build Cache**

**Вариант Б — Deploy Hook:**
1. **Settings** → **Git** → **Deploy Hooks**
2. Создай хук (напр. `manual`)
3. Запускай: `curl -X POST "https://api.vercel.com/v1/integrations/deploy/ТВОЙ_HOOK_ID"`

**Вариант В — Vercel CLI:**
```bash
npm i -g vercel
vercel login
cd /Users/leynch/Desktop/ycomp && vercel --prod
```

## 4. Лог и ошибки

- **Deployments** — смотри статус (Building / Error)
- **Activity** — могут быть сообщения вроде "Git author must have access to project"
- Комментарии Vercel Bot на GitHub к коммиту/PR
