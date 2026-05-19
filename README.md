# Facebook CRM Dashboard

Real-time CRM dashboard hiển thị tin nhắn Facebook với lead scoring Hot/Warm/Cold.

## Stack

- **Next.js 14** (App Router + TypeScript)
- **Tailwind CSS** — dark mode, responsive
- **Supabase** — realtime database
- **Lucide React** — icons

## Tính năng

- Bảng tin nhắn với cột: Thời gian, Sender ID, Nội dung, Score
- Badge màu: Hot (đỏ), Warm (vàng), Cold (xanh)
- Filter: All / Hot / Warm / Cold
- Search theo nội dung tin nhắn
- Auto refresh mỗi 30 giây + countdown
- Skeleton loading, empty state, error state

## Setup

### 1. Cài dependencies

```bash
npm install
```

### 2. Tạo file `.env.local`

```bash
cp .env.example .env.local
```

Điền vào `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Lấy từ: [Supabase Dashboard](https://app.supabase.com) → Project Settings → API

### 3. Tạo bảng Supabase

Chạy file `supabase/schema.sql` trong **Supabase SQL Editor**:

```sql
-- Xem nội dung tại supabase/schema.sql
```

File này sẽ:
- Tạo bảng `messages` với các cột đúng schema
- Bật Row Level Security + policy read public
- Tạo index cho score và content search
- Seed 10 tin nhắn mẫu

### 4. Chạy dev server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## Schema bảng `messages`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `id` | bigserial | Primary key |
| `created_at` | timestamptz | Thời gian tạo |
| `sender_id` | text | ID người gửi |
| `content` | text | Nội dung tin nhắn |
| `score` | text | `Hot` / `Warm` / `Cold` |
