-- Office TikTok Command Center v3
-- Run this entire script in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'Account Manager',
  active boolean not null default true,
  color text not null default '#2563eb',
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default 'blue',
  status text not null default 'Active',
  identifier text,
  notes text,
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tiktok_accounts (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  username text not null,
  gmail text,
  content_name text,
  manager_id uuid references public.team_members(id) on delete set null,
  status text not null default 'Active' check (status in ('Active','Paused','Needs attention')),
  notes text,
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.team_members add column if not exists color text not null default '#2563eb';
alter table public.devices add column if not exists color text not null default 'blue';
alter table public.devices add column if not exists status text not null default 'Active';

create index if not exists idx_accounts_device on public.tiktok_accounts(device_id);
create index if not exists idx_accounts_manager on public.tiktok_accounts(manager_id);
create index if not exists idx_accounts_username on public.tiktok_accounts(lower(username));

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists team_members_updated_at on public.team_members;
create trigger team_members_updated_at before update on public.team_members for each row execute procedure public.touch_updated_at();
drop trigger if exists devices_updated_at on public.devices;
create trigger devices_updated_at before update on public.devices for each row execute procedure public.touch_updated_at();
drop trigger if exists tiktok_accounts_updated_at on public.tiktok_accounts;
create trigger tiktok_accounts_updated_at before update on public.tiktok_accounts for each row execute procedure public.touch_updated_at();

alter table public.team_members enable row level security;
alter table public.devices enable row level security;
alter table public.tiktok_accounts enable row level security;

drop policy if exists "authenticated_team_select" on public.team_members;
drop policy if exists "authenticated_team_modify" on public.team_members;
drop policy if exists "authenticated_device_select" on public.devices;
drop policy if exists "authenticated_device_modify" on public.devices;
drop policy if exists "authenticated_account_select" on public.tiktok_accounts;
drop policy if exists "authenticated_account_modify" on public.tiktok_accounts;

create policy "authenticated_team_select" on public.team_members for select to authenticated using (true);
create policy "authenticated_team_modify" on public.team_members for all to authenticated using (true) with check (true);
create policy "authenticated_device_select" on public.devices for select to authenticated using (true);
create policy "authenticated_device_modify" on public.devices for all to authenticated using (true) with check (true);
create policy "authenticated_account_select" on public.tiktok_accounts for select to authenticated using (true);
create policy "authenticated_account_modify" on public.tiktok_accounts for all to authenticated using (true) with check (true);

insert into public.team_members (name, role, color)
select * from (values
  ('Umm-e-Hania','Account Manager','#2563eb'),
  ('Fiza','Account Manager','#0ea5e9'),
  ('Humaira','Account Manager','#475569')
) as x(name,role,color)
where not exists (select 1 from public.team_members t where lower(t.name)=lower(x.name));

insert into public.devices (name,color,status,identifier)
select * from (values
  ('Black','blue','Active','Device #1'),
  ('White','charcoal','Active','Device #2'),
  ('Sky Blue','sky','Active','Device #3')
) as x(name,color,status,identifier)
where not exists (select 1 from public.devices d where lower(d.name)=lower(x.name));

insert into public.tiktok_accounts (device_id,username,manager_id)
select d.id,x.username,t.id
from (values
  ('Black','Mr pow','Umm-e-Hania'),
  ('Black','cleancrazi1','Umm-e-Hania'),
  ('Black','cleaningasmr000','Umm-e-Hania'),
  ('Black','tungtung homies','Umm-e-Hania'),
  ('Black','rugcleaningasmr001','Umm-e-Hania'),
  ('Black','animalaignmenthub','Umm-e-Hania'),
  ('White','junktojackpotshoes','Fiza'),
  ('White','thegeekvaultcleaning','Fiza'),
  ('White','junktojackpot','Fiza'),
  ('White','treasurehunt051','Fiza'),
  ('Sky Blue','vendingmachinebusiness2','Humaira'),
  ('Sky Blue','humankindness3','Humaira'),
  ('Sky Blue','cats4care','Humaira'),
  ('Sky Blue','shaguntoodielies','Humaira'),
  ('Sky Blue','bitamiskitchen','Humaira'),
  ('Sky Blue','growyourbrand','Humaira')
) as x(device_name,username,manager_name)
join public.devices d on lower(d.name)=lower(x.device_name)
left join public.team_members t on lower(t.name)=lower(x.manager_name)
where not exists(select 1 from public.tiktok_accounts a where a.device_id=d.id and lower(a.username)=lower(x.username));

-- Create the office user in Supabase Dashboard -> Authentication -> Users.
-- Use only the anon/publishable key in the browser, never service_role.
