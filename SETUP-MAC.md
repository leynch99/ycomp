# Настройка проекта на Mac (для работы с Windows)

## 1. Один раз: авторизация в GitHub

**Вариант А — через GitHub CLI (рекомендуется):**
```bash
brew install gh
gh auth login
# Выбери: GitHub.com → HTTPS → Login with browser
```

**Вариант Б — через SSH:**
```bash
ssh-keygen -t ed25519 -C "твой@email.com" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# Скопируй ключ и добавь в GitHub: Settings → SSH and GPG keys → New SSH key
```

Если выбрал SSH, переключи remote:
```bash
cd /Users/leynch/Desktop/ycomp
git remote set-url origin git@github.com:leynch99/ycomp.git
```

## 2. Подтянуть проект

```bash
cd /Users/leynch/Desktop/ycomp
git fetch origin
git checkout main
git pull origin main
```

## 3. Работа с двух устройств

- **Mac:** `git pull` → вносишь изменения → `git add` → `git commit` → `git push`
- **Windows:** `git pull` → вносишь изменения → `git add` → `git commit` → `git push`

Главное — делать `git pull` перед началом работы и `git push` после изменений.
