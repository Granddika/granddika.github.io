# Granddika portfolio

Статический сайт-портфолио с визуальной админкой Decap CMS.

## Как обновлять портфолио

После подключения GitHub, Netlify Identity и Git Gateway:

1. Открыть `https://granddika.netlify.app/admin/`.
2. Войти по приглашению владельца сайта.
3. Открыть «Портфолио» → «Работы».
4. Добавить или изменить карточку.
5. Нажать «Опубликовать».

Netlify автоматически развернёт новую версию из ветки `main`.

## Настройка Netlify

- Publish directory: `.`
- Functions directory: `netlify/functions`
- Environment variables for the Telegram form:
  - `TELEGRAM_TOKEN`
  - `TELEGRAM_CHAT_ID`

Для админки включить Netlify Identity, регистрацию только по приглашениям и Git Gateway.
