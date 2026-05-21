alter table public.user_profiles
add column if not exists status text not null default 'pending'
check (status in ('pending', 'active', 'disabled'));

-- Existing users were already approved before this feature was added
update public.user_profiles set status = 'active';
