# 📝 Real-time Collaborative Notes

Веб-застосунок для спільного редагування нотаток у реальному часі. Декілька користувачів можуть одночасно працювати з одним документом — зміни кожного учасника миттєво відображаються в усіх інших без перезавантаження сторінки.

🔗 **Live Demo:** [https://notes-realtime.vercel.app](https://notes-realtime.vercel.app)

---

## ✨ Функціонал

- 🔐 Реєстрація та авторизація користувача
- 📄 Створення, редагування та видалення нотаток
- 🔗 Надання спільного доступу до нотатки іншим користувачам по email
- 👥 Розподіл ролей: **viewer** (тільки перегляд) / **editor** (редагування)
- 🟢 Відображення списку користувачів, які зараз онлайн у документі
- ⚡ Синхронізація змін між усіма учасниками в реальному часі

---

## 🛠 Технічний стек

| Шар | Технологія |
|-----|-----------|
| Фронтенд | React 19 + Vite |
| База даних | Supabase (PostgreSQL) |
| Авторизація | Supabase Auth |
| Realtime | Supabase Realtime (WebSockets + Presence) |
| Деплой | Vercel |

---

## 🚀 Як запустити локально

### 1. Клонуй репозиторій

```bash
git clone https://github.com/YOUR_USERNAME/notes-realtime.git
cd notes-realtime
```

### 2. Встанови залежності

```bash
npm install
```


### 3. Налаштуй базу даних

Виконай у Supabase SQL Editor:

```sql
-- Таблиця нотаток
create table notes (
  id uuid default gen_random_uuid() primary key,
  title text not null default 'Без назви',
  content text default '',
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Таблиця доступу
create table note_access (
  id uuid default gen_random_uuid() primary key,
  note_id uuid references notes(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('viewer', 'editor')) default 'viewer',
  unique(note_id, user_id)
);

-- Функції для RLS (уникнення рекурсії)
create or replace function get_my_note_ids()
returns setof uuid language sql security definer stable as $$
  select id from notes where owner_id = auth.uid();
$$;

create or replace function get_shared_note_ids()
returns setof uuid language sql security definer stable as $$
  select note_id from note_access where user_id = auth.uid();
$$;

-- RLS політики
alter table notes enable row level security;
alter table note_access enable row level security;

create policy "owner full access" on notes
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "shared can select" on notes
  for select using (id in (select get_shared_note_ids()));

create policy "shared editor can update" on notes
  for update using (
    id in (select note_id from note_access where user_id = auth.uid() and role = 'editor')
  );

create policy "note_access_select" on note_access
  for select using (auth.uid() = user_id or note_id in (select get_my_note_ids()));

create policy "note_access_insert" on note_access
  for insert with check (note_id in (select get_my_note_ids()));

create policy "note_access_delete" on note_access
  for delete using (note_id in (select get_my_note_ids()));

-- Функція для пошуку користувача по email
create or replace function get_user_id_by_email(email_input text)
returns uuid language sql security definer as $$
  select id from auth.users where email = email_input limit 1;
$$;
```

### 4. Запусти проєкт

```bash
npm run dev
```

Відкрий [http://localhost:5173](http://localhost:5173)

---

## 🏗 Архітектура

```
┌─────────────────────────────────────────────┐
│                   Клієнт                    │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Login / │  │Dashboard │  │   Note   │  │
│  │ Register │  │          │  │   Page   │  │
│  └──────────┘  └──────────┘  └────┬─────┘  │
│                                   │        │
│              React Router         │        │
└───────────────────────────────────┼────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
             ┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
             │ Supabase    │ │ Supabase   │ │ Supabase   │
             │    Auth     │ │    DB      │ │  Realtime  │
             │             │ │(PostgreSQL)│ │(WebSockets)│
             └─────────────┘ └────────────┘ └────────────┘
```

### Як працює Realtime

```
Користувач А друкує текст
        │
        ▼
handleContentChange()
        │
        ├──► channel.send(broadcast)  ──► Supabase передає всім
        │                                        │
        │                              Користувач Б отримує
        │                              .on('broadcast') спрацьовує
        │                              setContent() оновлює UI
        │
        └──► setTimeout 500ms ──► supabase.update() зберігає в БД
```

**Presence** — відстежує хто зараз онлайн у документі через `channel.track()`.

**RLS (Row Level Security)** — база даних сама перевіряє права доступу перед кожним запитом, захищаючи дані навіть якщо фронтенд обійдено.

---

## 📁 Структура проєкту

```
src/
├── lib/
│   └── supabase.js        # Ініціалізація Supabase клієнта
├── pages/
│   ├── Login.jsx          # Сторінка входу
│   ├── Register.jsx       # Сторінка реєстрації
│   ├── Dashboard.jsx      # Список нотаток
│   └── Note.jsx           # Редактор нотатки з realtime
├── App.jsx                # Роутинг + auth стан
├── main.jsx               # Точка входу
└── index.css              # Глобальні стилі
```
