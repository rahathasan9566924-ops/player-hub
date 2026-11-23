-- eFootball Zone 0.1: additive database foundation
-- REVIEW BEFORE APPLYING. This file is NOT executed against Supabase.
-- All objects use the zone_ prefix. No existing tables, policies, or data are altered.

begin;

create table if not exists public.zone_data_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_url text not null,
  reuse_permission text not null default 'not_confirmed'
    check (reuse_permission in ('not_confirmed','permitted','restricted','user_provided')),
  attribution text,
  notes text,
  created_at timestamptz not null default now(),
  unique (name, source_url)
);

create table if not exists public.zone_player_identities (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  nationality text,
  date_of_birth date,
  height_cm integer check (height_cm is null or height_cm between 100 and 250),
  strong_foot text check (strong_foot is null or strong_foot in ('Right','Left','Both')),
  external_ids jsonb not null default '{}'::jsonb,
  source_id uuid references public.zone_data_sources(id) on delete restrict,
  source_record_id text,
  verification_status text not null default 'unverified'
    check (verification_status in ('verified','partial','unverified')),
  published boolean not null default false,
  retrieved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists zone_player_identity_source_key
  on public.zone_player_identities(source_id, source_record_id)
  where source_id is not null and source_record_id is not null;

create table if not exists public.zone_player_cards (
  id uuid primary key default gen_random_uuid(),
  identity_id uuid references public.zone_player_identities(id) on delete set null,
  source_id uuid not null references public.zone_data_sources(id) on delete restrict,
  source_record_id text not null,
  card_name text,
  card_type text,
  pack_name text,
  database_version text,
  release_date date,
  position text not null check (position in ('GK','CB','LB','RB','DMF','CMF','AMF','LMF','RMF','LWF','RWF','SS','CF')),
  playstyle text,
  overall integer check (overall is null or overall between 1 and 110),
  max_overall integer check (max_overall is null or max_overall between 1 and 110),
  attributes jsonb not null default '{}'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  positions jsonb not null default '{}'::jsonb,
  card_image_url text,
  raw_source_data jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified'
    check (verification_status in ('verified','partial','unverified')),
  published boolean not null default false,
  retrieved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, source_record_id)
);

create index if not exists zone_player_cards_position_idx
  on public.zone_player_cards(position);
create index if not exists zone_player_cards_overall_idx
  on public.zone_player_cards(overall desc);
create index if not exists zone_player_cards_identity_idx
  on public.zone_player_cards(identity_id);

create table if not exists public.zone_managers (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.zone_data_sources(id) on delete restrict,
  source_record_id text not null,
  name text not null,
  team text,
  nationality text,
  formation text,
  attacking_playstyle text,
  build_up text,
  attacking_area text,
  positioning text,
  defensive_playstyle text,
  containment_area text,
  pressuring text,
  defensive_line numeric check (defensive_line is null or defensive_line between 0 and 100),
  compactness numeric check (compactness is null or compactness between 0 and 100),
  boosters jsonb not null default '[]'::jsonb,
  link_up jsonb not null default '[]'::jsonb,
  raw_source_data jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified'
    check (verification_status in ('verified','partial','unverified')),
  published boolean not null default false,
  retrieved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, source_record_id)
);

create index if not exists zone_managers_name_idx
  on public.zone_managers using btree (name);

create table if not exists public.zone_import_batches (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.zone_data_sources(id) on delete restrict,
  entity_type text not null check (entity_type in ('player_identity','player_card','manager')),
  file_name text not null,
  file_sha256 text not null,
  row_count integer not null check (row_count >= 0),
  imported_count integer not null default 0 check (imported_count >= 0),
  rejected_count integer not null default 0 check (rejected_count >= 0),
  status text not null default 'validated'
    check (status in ('validated','imported','failed')),
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Admin membership is intentionally not self-service. A project owner adds user UUIDs
-- manually after verifying the account. No client-side service-role key is required.
create table if not exists public.zone_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.zone_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.zone_admins a
    where a.user_id = (select auth.uid())
      and a.active = true
  );
$$;

revoke all on function public.zone_is_admin() from public;
grant execute on function public.zone_is_admin() to anon, authenticated;

alter table public.zone_data_sources enable row level security;
alter table public.zone_player_identities enable row level security;
alter table public.zone_player_cards enable row level security;
alter table public.zone_managers enable row level security;
alter table public.zone_import_batches enable row level security;
alter table public.zone_admins enable row level security;

-- Public visitors can only read published records and source attribution.
drop policy if exists zone_sources_public_read on public.zone_data_sources;
create policy zone_sources_public_read on public.zone_data_sources
  for select to anon, authenticated using (true);
drop policy if exists zone_identities_public_read on public.zone_player_identities;
create policy zone_identities_public_read on public.zone_player_identities
  for select to anon, authenticated using (published = true or public.zone_is_admin());
drop policy if exists zone_cards_public_read on public.zone_player_cards;
create policy zone_cards_public_read on public.zone_player_cards
  for select to anon, authenticated using (published = true or public.zone_is_admin());
drop policy if exists zone_managers_public_read on public.zone_managers;
create policy zone_managers_public_read on public.zone_managers
  for select to anon, authenticated using (published = true or public.zone_is_admin());
drop policy if exists zone_batches_admin_read on public.zone_import_batches;
create policy zone_batches_admin_read on public.zone_import_batches
  for select to authenticated using (public.zone_is_admin());
drop policy if exists zone_admins_self_read on public.zone_admins;
create policy zone_admins_self_read on public.zone_admins
  for select to authenticated using (user_id = (select auth.uid()) or public.zone_is_admin());

-- Only approved admins may write. Membership itself is not writable from the browser.
drop policy if exists zone_sources_admin_write on public.zone_data_sources;
create policy zone_sources_admin_write on public.zone_data_sources
  for all to authenticated using (public.zone_is_admin()) with check (public.zone_is_admin());
drop policy if exists zone_identities_admin_write on public.zone_player_identities;
create policy zone_identities_admin_write on public.zone_player_identities
  for all to authenticated using (public.zone_is_admin()) with check (public.zone_is_admin());
drop policy if exists zone_cards_admin_write on public.zone_player_cards;
create policy zone_cards_admin_write on public.zone_player_cards
  for all to authenticated using (public.zone_is_admin()) with check (public.zone_is_admin());
drop policy if exists zone_managers_admin_write on public.zone_managers;
create policy zone_managers_admin_write on public.zone_managers
  for all to authenticated using (public.zone_is_admin()) with check (public.zone_is_admin());
drop policy if exists zone_batches_admin_write on public.zone_import_batches;
create policy zone_batches_admin_write on public.zone_import_batches
  for all to authenticated using (public.zone_is_admin()) with check (public.zone_is_admin());

grant select on public.zone_data_sources, public.zone_player_identities,
  public.zone_player_cards, public.zone_managers to anon, authenticated;
grant insert, update, delete on public.zone_data_sources, public.zone_player_identities,
  public.zone_player_cards, public.zone_managers, public.zone_import_batches to authenticated;
grant select, insert, update, delete on public.zone_import_batches to authenticated;
grant select on public.zone_admins to authenticated;

commit;
