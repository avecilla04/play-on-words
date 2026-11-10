-- ============================================================
-- RACHA DIARIA + NOTIFICACIONES
-- ============================================================
-- Ejecutar UNA VEZ en Supabase → SQL Editor → New query → Run.
-- Se puede volver a ejecutar sin problemas.
-- ============================================================


-- ------------------------------------------------------------
-- 1. DÍAS PRACTICADOS (para la racha)
-- ------------------------------------------------------------

create table if not exists public.practice_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.practice_days enable row level security;

drop policy if exists "practice_days_select_own" on public.practice_days;
create policy "practice_days_select_own"
  on public.practice_days for select
  using (auth.uid() = user_id);

drop policy if exists "practice_days_insert_own" on public.practice_days;
create policy "practice_days_insert_own"
  on public.practice_days for insert
  with check (auth.uid() = user_id);

-- Recuperar los días de las partidas que ya terminaste antes.
insert into public.practice_days (user_id, day)
select distinct user_id, (completed_at at time zone 'Europe/Madrid')::date
from public.games
where completed_at is not null
on conflict do nothing;


-- ------------------------------------------------------------
-- 2. SUSCRIPCIONES A NOTIFICACIONES (una por dispositivo)
-- ------------------------------------------------------------

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_select_own" on public.push_subscriptions;
create policy "push_select_own"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "push_insert_own" on public.push_subscriptions;
create policy "push_insert_own"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "push_update_own" on public.push_subscriptions;
create policy "push_update_own"
  on public.push_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "push_delete_own" on public.push_subscriptions;
create policy "push_delete_own"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);
