alter table public.user_profiles
add column if not exists assigned_page_ids text[] default '{}';
