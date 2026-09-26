-- ============================================================================
-- Builder profiles - student name + email
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run: every statement is idempotent.
-- ============================================================================

create table if not exists builder_profiles (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  display_name text not null,
  created_at   timestamptz not null default now(),

  constraint builder_profiles_email_format
    check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint builder_profiles_name_not_blank
    check (length(trim(display_name)) > 0)
);

-- If you already ran an earlier version that had `alias`, drop it:
alter table builder_profiles drop constraint if exists builder_profiles_alias_format;
drop index if exists builder_profiles_alias_unique;
alter table builder_profiles drop column if exists alias;

-- Ensure display_name is required (for tables created with it optional).
alter table builder_profiles alter column display_name set not null;

-- One row per student email.
create unique index if not exists builder_profiles_email_unique
  on builder_profiles (lower(email));

alter table builder_profiles enable row level security;

-- Public form may insert. Nobody anonymous may read student emails.
drop policy if exists "anyone can submit builder profile" on builder_profiles;
create policy "anyone can submit builder profile"
  on builder_profiles
  for insert
  to anon, authenticated
  with check (true);

-- Staff (any promoted role) can list submissions.
drop policy if exists "staff reads builder profiles" on builder_profiles;
create policy "staff reads builder profiles"
  on builder_profiles
  for select
  to authenticated
  using (
    private.has_role(array[
      'owner','admin','program','comms','partnerships','volunteer'
    ]::member_role[])
  );

-- Owners can clean up bad rows.
drop policy if exists "owner deletes builder profiles" on builder_profiles;
create policy "owner deletes builder profiles"
  on builder_profiles
  for delete
  to authenticated
  using (private.has_role(array['owner']::member_role[]));

-- Public lucky-draw page only needs names (no emails).
-- security_invoker = false so anon can read via the view without table RLS blocking.
create or replace view lucky_draw_roster
with (security_invoker = false) as
  select id, display_name
  from builder_profiles;

grant select on lucky_draw_roster to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Optional: seed / bulk-load later with COPY or INSERT … VALUES
-- Example:
--   insert into builder_profiles (email, display_name) values
--     ('student@sheridancollege.ca', 'Jane Doe')
--   on conflict do nothing;
-- ---------------------------------------------------------------------------
