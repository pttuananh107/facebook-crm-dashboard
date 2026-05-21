-- Bảng user_profiles liên kết với auth.users
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'viewer' check (role in ('super_admin', 'admin', 'viewer')),
  assigned_page_ids text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table public.user_profiles enable row level security;

create policy "Users can read own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Super admin can read all profiles"
  on public.user_profiles for select
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Super admin can update all profiles"
  on public.user_profiles for update
  using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

create policy "Super admin can insert profiles"
  on public.user_profiles for insert
  with check (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );
