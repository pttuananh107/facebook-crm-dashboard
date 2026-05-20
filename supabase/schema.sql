-- Create pages table
create table if not exists public.pages (
  page_id      text        primary key,
  page_name    text        not null,
  access_token text,
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now()
);

alter table public.pages enable row level security;

create policy "Allow public read pages"
  on public.pages for select using (true);

create policy "Allow public insert pages"
  on public.pages for insert with check (true);

create policy "Allow public update pages"
  on public.pages for update using (true);

create policy "Allow public delete pages"
  on public.pages for delete using (true);

-- Add page_id column to messages (if not exists)
alter table public.messages add column if not exists page_id text references public.pages(page_id) on delete set null;

create index if not exists messages_page_id_idx on public.messages (page_id);

-- Create messages table
create table if not exists public.messages (
  id          bigserial primary key,
  created_at  timestamptz not null default now(),
  sender_id   text        not null,
  content     text        not null,
  score       text        not null check (score in ('Hot', 'Warm', 'Cold'))
);

-- Enable Row Level Security
alter table public.messages enable row level security;

-- Allow anonymous read access (for the anon key)
create policy "Allow public read"
  on public.messages
  for select
  using (true);

-- Index for faster score filtering
create index if not exists messages_score_idx on public.messages (score);

-- Index for faster content search
create index if not exists messages_content_idx on public.messages using gin (to_tsvector('simple', content));

-- Seed some sample data
insert into public.messages (sender_id, content, score, created_at) values
  ('user_001', 'Tôi muốn mua sản phẩm này ngay hôm nay, giá bao nhiêu vậy?', 'Hot', now() - interval '2 minutes'),
  ('user_002', 'Cho tôi hỏi thêm về chính sách bảo hành nhé', 'Warm', now() - interval '5 minutes'),
  ('user_003', 'Sản phẩm này có màu xanh không?', 'Cold', now() - interval '10 minutes'),
  ('user_004', 'Tôi cần mua gấp 10 bộ, có thể giao hôm nay không?', 'Hot', now() - interval '15 minutes'),
  ('user_005', 'Giá có thể giảm thêm không nếu mua số lượng lớn?', 'Warm', now() - interval '20 minutes'),
  ('user_006', 'Bao lâu thì giao hàng tới TP.HCM?', 'Cold', now() - interval '25 minutes'),
  ('user_007', 'OK tôi chốt đơn luôn, gửi link thanh toán cho tôi', 'Hot', now() - interval '30 minutes'),
  ('user_008', 'Sản phẩm này có phù hợp cho trẻ em không?', 'Warm', now() - interval '35 minutes'),
  ('user_009', 'Shop có cửa hàng offline ở đâu không?', 'Cold', now() - interval '40 minutes'),
  ('user_010', 'Tôi đã dùng thử và muốn đặt thêm 5 cái nữa', 'Hot', now() - interval '45 minutes');
