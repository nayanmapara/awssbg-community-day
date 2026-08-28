-- ============================================================================
-- ALREADY APPLIED to project ssuzhrvdtpakzbwsvlch (ca-central-1).
-- This file is the single-file equivalent of the 8 migrations in that project,
-- kept so the whole stack can be rebuilt in a fresh Supabase project.
-- Do NOT run it against the live project.
-- ============================================================================
-- ============================================================================
-- AWS Community Day @ Sheridan College — Supabase schema
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run: every statement is idempotent.
-- ============================================================================

create extension if not exists "pgcrypto";

-- PostgREST exposes every function in `public` as an RPC endpoint, so all
-- helpers and trigger functions live in a schema it does not expose.
create schema if not exists private;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
do $$ begin
  create type content_status as enum ('draft','published','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  -- 'pending' has NO access. Every new sign-in lands here until an owner
  -- promotes them, so simply having a Google account grants nothing.
  create type member_role as enum ('pending','owner','admin','program','comms','partnerships','volunteer');
exception when duplicate_object then null; end $$;

-- If the type already existed from an earlier run, add the new value.
do $$ begin
  alter type member_role add value if not exists 'pending';
exception when others then null; end $$;

do $$ begin
  create type session_kind as enum ('keynote','talk','workshop','jam','break','networking','admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sponsor_tier as enum ('platinum','gold','silver','community');
exception when duplicate_object then null; end $$;

do $$ begin
  create type team_tier as enum ('lead','member','alumni');
exception when duplicate_object then null; end $$;

do $$ begin
  create type announce_level as enum ('info','important','urgent');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- PROFILES  (one row per admin, linked to Supabase auth)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email        text unique not null,
  role         member_role not null default 'pending',
  avatar_path  text,
  active       boolean not null default true,
  last_seen_at timestamptz,
  created_at   timestamptz not null default now()
);

-- Helper functions used by every policy below.
create or replace function private.current_role_of()
returns member_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and active
$$;

create or replace function private.has_role(roles member_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(private.current_role_of() = any(roles), false)
$$;

-- RLS is evaluated as the querying role, so authenticated needs EXECUTE on
-- these two — and only these two.
revoke all on function private.current_role_of() from public;
revoke all on function private.has_role(member_role[]) from public;
grant execute on function private.current_role_of() to authenticated;
grant execute on function private.has_role(member_role[]) to authenticated;

-- ---------------------------------------------------------------------------
-- EVENT SETTINGS  (single row, id = true)
-- ---------------------------------------------------------------------------
create table if not exists event_settings (
  id                 boolean primary key default true check (id),
  name               text not null default 'AWS Community Day 2026',
  starts_at          timestamptz not null,
  ends_at            timestamptz not null,
  venue_name         text,
  venue_address      text,
  map_query          text,
  registration_url   text,
  registration_open  boolean not null default true,
  cost_label         text default 'FREE',
  capacity_note      text default 'Seats are limited',
  hero_headline      text,
  hero_subline       text,
  og_image_path      text,
  registered_count   integer not null default 0,   -- synced from Luma
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CONTENT TABLES
-- ---------------------------------------------------------------------------
create table if not exists agenda_items (
  id          uuid primary key default gen_random_uuid(),
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  title       text not null,
  attribution text,                       -- "SPEAKER TBA", "CLUB MEMBERS"
  description text,
  kind        session_kind not null default 'talk',
  room        text,
  track       text,
  status      content_status not null default 'draft',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint agenda_time_valid check (ends_at > starts_at)
);

create table if not exists speakers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  title         text,
  company       text,
  topic         text,
  bio           text,
  headshot_path text,
  linkedin_url  text,
  is_keynote    boolean not null default false,
  announce_at   timestamptz,              -- scheduled reveal; null = immediate
  status        content_status not null default 'draft',
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- cannot publish an incomplete speaker card
  constraint speaker_publish_ready check (
    status <> 'published' or (bio is not null and headshot_path is not null)
  )
);

create table if not exists agenda_speakers (
  agenda_item_id uuid references agenda_items(id) on delete cascade,
  speaker_id     uuid references speakers(id) on delete cascade,
  primary key (agenda_item_id, speaker_id)
);

create table if not exists team_members (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  role_label    text,
  title_label   text,
  bio           text,
  initials      text,
  headshot_path text,
  linkedin_url  text,
  tier          team_tier not null default 'member',
  status        content_status not null default 'draft',
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists sponsors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_path   text,
  website_url text,
  blurb       text,
  tier        sponsor_tier not null default 'community',
  status      content_status not null default 'draft',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists highlights (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  status      content_status not null default 'draft',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists stats (
  id          uuid primary key default gen_random_uuid(),
  value       text not null,              -- '7+', '700+' — free text on purpose
  label       text not null,
  status      content_status not null default 'draft',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists faqs (
  id         uuid primary key default gen_random_uuid(),
  question   text not null,
  answer     text not null,
  category   text,
  status     content_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gallery_items (
  id          uuid primary key default gen_random_uuid(),
  image_path  text not null,
  caption     text,
  event_label text,
  alt_text    text,
  taken_on    date,
  status      content_status not null default 'draft',
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists announcements (
  id         uuid primary key default gen_random_uuid(),
  body       text not null,
  level      announce_level not null default 'info',
  link_url   text,
  starts_at  timestamptz,
  ends_at    timestamptz,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists checkins (
  id            uuid primary key default gen_random_uuid(),
  attendee_name text not null,
  email         text,
  ticket_code   text,
  source        text not null default 'qr',
  checked_in_at timestamptz not null default now(),
  checked_in_by uuid references profiles(id)
);
create unique index if not exists checkins_ticket_unique
  on checkins (ticket_code) where ticket_code is not null;

create table if not exists audit_log (
  id         bigserial primary key,
  actor_id   uuid references profiles(id),
  table_name text not null,
  record_id  text,
  action     text not null,
  diff       jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TRIGGERS: updated_at + audit trail
-- ---------------------------------------------------------------------------
create or replace function private.touch_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create or replace function private.write_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare rec_id text;
begin
  rec_id := coalesce((to_jsonb(new)->>'id'), (to_jsonb(old)->>'id'));
  insert into audit_log (actor_id, table_name, record_id, action, diff)
  values (
    auth.uid(), tg_table_name, rec_id, lower(tg_op),
    case tg_op
      when 'DELETE' then jsonb_build_object('before', to_jsonb(old))
      when 'INSERT' then jsonb_build_object('after',  to_jsonb(new))
      else jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new))
    end
  );
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'agenda_items','speakers','team_members','sponsors',
    'highlights','stats','faqs','gallery_items','announcements','event_settings'
  ] loop
    execute format('drop trigger if exists trg_touch_%1$s on %1$s', t);
    execute format(
      'create trigger trg_touch_%1$s before update on %1$s
       for each row execute function private.touch_updated_at()', t);

    execute format('drop trigger if exists trg_audit_%1$s on %1$s', t);
    execute format(
      'create trigger trg_audit_%1$s after insert or update or delete on %1$s
       for each row execute function private.write_audit()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Public (anon) may read PUBLISHED rows only. Writes are role-scoped.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','event_settings','agenda_items','speakers','agenda_speakers',
    'team_members','sponsors','highlights','stats','faqs','gallery_items',
    'announcements','checkins','audit_log'
  ] loop
    execute format('alter table %s enable row level security', t);
  end loop;
end $$;

-- Public read: published content only
do $$
declare t text;
begin
  foreach t in array array[
    'agenda_items','speakers','team_members','sponsors',
    'highlights','stats','faqs','gallery_items'
  ] loop
    execute format('drop policy if exists "public reads published" on %s', t);
    execute format(
      'create policy "public reads published" on %s
       for select using (status = ''published'')', t);

    execute format('drop policy if exists "members read all" on %s', t);
    execute format(
      'create policy "members read all" on %s
       for select to authenticated using (private.has_role(array[
         ''owner'',''admin'',''program'',''comms'',''partnerships''
       ]::member_role[]))', t);
  end loop;
end $$;

-- Speakers with a future announce_at stay hidden from the public
drop policy if exists "public reads published" on speakers;
create policy "public reads published" on speakers
  for select using (
    status = 'published' and (announce_at is null or announce_at <= now())
  );

-- Settings, announcements, join table: readable by everyone
drop policy if exists "public reads settings" on event_settings;
create policy "public reads settings" on event_settings for select using (true);

drop policy if exists "public reads live announcements" on announcements;
create policy "public reads live announcements" on announcements
  for select using (
    active
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >= now())
  );

drop policy if exists "public reads agenda_speakers" on agenda_speakers;
create policy "public reads agenda_speakers" on agenda_speakers for select using (true);

-- Write policies, per section owner
do $$
declare
  spec record;
begin
  for spec in
    select * from (values
      ('agenda_items',  array['owner','admin','program']),
      ('speakers',      array['owner','admin','program','partnerships']),
      ('agenda_speakers', array['owner','admin','program']),
      ('team_members',  array['owner','admin','comms']),
      ('sponsors',      array['owner','admin','partnerships']),
      ('highlights',    array['owner','admin','comms']),
      ('stats',         array['owner','admin','comms']),
      ('faqs',          array['owner','admin','comms']),
      ('gallery_items', array['owner','admin','comms']),
      ('announcements', array['owner','admin','comms']),
      ('event_settings',array['owner','admin'])
    ) as t(tbl, roles)
  loop
    execute format('drop policy if exists "role writes" on %s', spec.tbl);
    execute format(
      'create policy "role writes" on %s
       for all to authenticated
       using (private.has_role(%L::member_role[]))
       with check (private.has_role(%L::member_role[]))',
      spec.tbl, spec.roles, spec.roles);
  end loop;
end $$;

-- Only the owner may hard-delete content; everyone else archives.
do $$
declare t text;
begin
  foreach t in array array[
    'agenda_items','speakers','team_members','sponsors',
    'highlights','stats','faqs','gallery_items'
  ] loop
    execute format('drop policy if exists "owner deletes only" on %s', t);
    execute format(
      'create policy "owner deletes only" on %s
       for delete to authenticated
       using (private.has_role(array[''owner'']::member_role[]))', t);
  end loop;
end $$;

-- Check-in: volunteers and up may write, nobody public may read
drop policy if exists "staff manages checkins" on checkins;
create policy "staff manages checkins" on checkins
  for all to authenticated
  using (private.has_role(array['owner','admin','program','comms','partnerships','volunteer']::member_role[]))
  with check (private.has_role(array['owner','admin','program','comms','partnerships','volunteer']::member_role[]));

-- Profiles
drop policy if exists "read own and team" on profiles;
create policy "read own and team" on profiles
  for select to authenticated using (true);

drop policy if exists "owner manages users" on profiles;
create policy "owner manages users" on profiles
  for all to authenticated
  using (private.has_role(array['owner']::member_role[]))
  with check (private.has_role(array['owner']::member_role[]));

-- Audit log: readable by staff, insert-only via trigger, never editable
drop policy if exists "staff reads audit" on audit_log;
create policy "staff reads audit" on audit_log
  for select to authenticated
  using (private.has_role(array['owner','admin','program','comms','partnerships']::member_role[]));

-- ---------------------------------------------------------------------------
-- HARDENING
-- ---------------------------------------------------------------------------

-- 1. Nobody may read the members-only tables anonymously. 'authenticated' here
--    means "has a Supabase session", which is why every policy also checks
--    has_role() — a signed-in 'pending' user passes the first test and fails
--    the second.

-- 2. The audit log is append-only. No update/delete policy exists, so those
--    are denied for every role; inserts happen only inside the SECURITY
--    DEFINER trigger.
revoke update, delete on audit_log from authenticated, anon;

-- 3. A user must never be able to change their own role. The only write policy
--    on profiles requires role 'owner', and this trigger blocks the edge case
--    of an owner accidentally demoting the last owner.
create or replace function private.guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare owner_count integer;
begin
  if old.role = 'owner' and new.role <> 'owner' then
    select count(*) into owner_count from profiles where role = 'owner' and active;
    if owner_count <= 1 then
      raise exception 'Cannot demote the last remaining owner';
    end if;
  end if;

  if new.id = auth.uid() and new.role <> old.role then
    raise exception 'You cannot change your own role';
  end if;

  return new;
end $$;

drop trigger if exists trg_guard_role on profiles;
create trigger trg_guard_role before update on profiles
  for each row execute function private.guard_role_change();

-- 4. Check-in rows are staff-only: no anon read policy exists, so attendee
--    names are never exposed publicly.

-- 5. Speakers with a future announce_at are invisible to anon (policy above),
--    so a scheduled reveal cannot be scraped early.

-- ---------------------------------------------------------------------------
-- STORAGE BUCKETS
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('headshots', 'headshots', true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('logos',     'logos',     true, 1048576, array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('gallery',   'gallery',   true, 5242880, array['image/jpeg','image/png','image/webp']),
  ('backups',   'backups',   false, 52428800, array['application/json'])
on conflict (id) do nothing;

drop policy if exists "public reads media" on storage.objects;
create policy "public reads media" on storage.objects
  for select using (bucket_id in ('headshots','logos','gallery'));

drop policy if exists "staff uploads media" on storage.objects;
create policy "staff uploads media" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('headshots','logos','gallery')
    and private.has_role(array['owner','admin','program','comms','partnerships']::member_role[])
  );

drop policy if exists "staff deletes media" on storage.objects;
create policy "staff deletes media" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('headshots','logos','gallery')
    and private.has_role(array['owner','admin']::member_role[])
  );

drop policy if exists "staff updates media" on storage.objects;
create policy "staff updates media" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('headshots','logos','gallery')
    and private.has_role(array['owner','admin','comms','partnerships']::member_role[])
  );

-- ---------------------------------------------------------------------------
-- CONVENIENCE VIEW: what the public site reads for the agenda
-- ---------------------------------------------------------------------------
create or replace view public_agenda
with (security_invoker = true) as
select
  a.id, a.starts_at, a.ends_at, a.title, a.attribution,
  a.kind, a.room, a.sort_order,
  coalesce(
    json_agg(json_build_object('name', s.name, 'company', s.company))
      filter (where s.id is not null),
    '[]'
  ) as speakers
from agenda_items a
left join agenda_speakers js on js.agenda_item_id = a.id
left join speakers s on s.id = js.speaker_id and s.status = 'published'
where a.status = 'published'
group by a.id
order by a.sort_order, a.starts_at;

-- ---------------------------------------------------------------------------
-- PERFORMANCE: single-round-trip reorder and admin sidebar draft counts
-- ---------------------------------------------------------------------------

-- Swaps sort_order with the row's neighbour in one round trip instead of the
-- three sequential queries (select, update, update) the reorder action used
-- to make, which is what made the up/down buttons feel laggy.
create or replace function swap_sort_order(
  p_table text,
  p_id_a  uuid,
  p_dir   integer
) returns void
language plpgsql
security invoker      -- runs as the caller, so RLS still applies
set search_path = public
as $$
declare
  v_allowed text[] := array[
    'agenda_items','speakers','team_members','sponsors',
    'highlights','stats','faqs','gallery_items','announcements'
  ];
  v_order_a integer;
  v_id_b    uuid;
  v_order_b integer;
begin
  -- Whitelist the table name: it is interpolated into dynamic SQL below.
  if not (p_table = any(v_allowed)) then
    raise exception 'Table not reorderable: %', p_table;
  end if;

  execute format('select sort_order from %I where id = $1', p_table)
    into v_order_a using p_id_a;
  if v_order_a is null then return; end if;

  if p_dir < 0 then
    execute format(
      'select id, sort_order from %I
        where status <> ''archived'' and sort_order < $1
        order by sort_order desc limit 1', p_table)
      into v_id_b, v_order_b using v_order_a;
  else
    execute format(
      'select id, sort_order from %I
        where status <> ''archived'' and sort_order > $1
        order by sort_order asc limit 1', p_table)
      into v_id_b, v_order_b using v_order_a;
  end if;

  if v_id_b is null then return; end if;   -- already at the end

  execute format('update %I set sort_order = $1 where id = $2', p_table)
    using v_order_b, p_id_a;
  execute format('update %I set sort_order = $1 where id = $2', p_table)
    using v_order_a, v_id_b;
end $$;

revoke all on function swap_sort_order(text, uuid, integer) from public, anon;
grant execute on function swap_sort_order(text, uuid, integer) to authenticated;

-- One query for the admin sidebar's per-section draft badges and the publish
-- diff, instead of fanning out one query per publishable table on every admin
-- navigation. security_invoker so each editor's role-based RLS still applies
-- to what shows up here — mirrors public_agenda above.
create or replace view pending_drafts
with (security_invoker = true) as
  select 'agenda'      as section, id::text, title           as label from agenda_items   where status = 'draft'
  union all select 'speakers',    id::text, name                     from speakers        where status = 'draft'
  union all select 'team',        id::text, name                     from team_members    where status = 'draft'
  union all select 'sponsors',    id::text, name                     from sponsors        where status = 'draft'
  union all select 'highlights',  id::text, title                    from highlights      where status = 'draft'
  union all select 'stats',       id::text, label                    from stats           where status = 'draft'
  union all select 'faqs',        id::text, question                 from faqs            where status = 'draft'
  union all select 'gallery',     id::text, coalesce(caption, 'Untitled photo') from gallery_items where status = 'draft';

-- ---------------------------------------------------------------------------
-- SEED: current site content
-- ---------------------------------------------------------------------------
insert into event_settings (
  id, starts_at, ends_at, venue_name, venue_address, map_query,
  registration_url, hero_headline, hero_subline
) values (
  true,
  '2026-09-26 10:00:00-04', '2026-09-26 17:00:00-04',
  'Sheridan College — Hazel McCallion Campus',
  'Mississauga, Ontario',
  'Sheridan College Hazel McCallion Campus Mississauga',
  'https://luma.com/11nchdym',
  'AWS Community Day Toronto 2026',
  'A full day of AWS learning, hands-on labs, and community for Sheridan College students.'
) on conflict (id) do nothing;

insert into agenda_items (starts_at, ends_at, title, attribution, kind, room, status, sort_order)
select * from (values
  ('2026-09-26 10:00-04'::timestamptz,'2026-09-26 10:30-04'::timestamptz,'Check-in & Registration','VOLUNTEER TEAM','admin'::session_kind,'Atrium','published'::content_status,1),
  ('2026-09-26 10:30-04','2026-09-26 11:00-04','Welcome & Keynote','SPEAKER TBA','keynote','B240','published',2),
  ('2026-09-26 11:00-04','2026-09-26 11:40-04','Talk on AWS','SPEAKER TBA','talk','B240','published',3),
  ('2026-09-26 11:45-04','2026-09-26 12:05-04','Workshop Prep','CLUB MEMBERS','workshop','B240','published',4),
  ('2026-09-26 12:10-04','2026-09-26 12:55-04','Break & Networking',null,'break','Atrium','published',5),
  ('2026-09-26 13:00-04','2026-09-26 15:00-04','AWS Jam','HANDS-ON · BRING A LAPTOP','jam','B240','published',6),
  ('2026-09-26 15:15-04','2026-09-26 16:00-04','Chat with Interns','INTERN PANEL · TBA','talk','B240','published',7),
  ('2026-09-26 16:00-04','2026-09-26 16:15-04','Q&A',null,'talk','B240','published',8),
  ('2026-09-26 16:15-04','2026-09-26 16:30-04','Break',null,'break','Atrium','published',9),
  ('2026-09-26 16:30-04','2026-09-26 16:45-04','Swag & Giveaways',null,'admin','B240','published',10),
  ('2026-09-26 16:45-04','2026-09-26 17:00-04','Closing Remarks','ORGANIZING TEAM','admin','B240','published',11)
) as v
where not exists (select 1 from agenda_items);

insert into team_members (name, role_label, title_label, bio, initials, tier, status, sort_order)
select * from (values
  ('Neel Patel','SBG LEAD','PRESIDENT','Leads club strategy, partnerships, and major programs including workshops and Community Day.','NP','lead'::team_tier,'published'::content_status,1),
  ('Sohel Shekh','HEAD OF EXPERIENCE','VICE PRESIDENT','Shapes member experience across events, workshops, and programming.','SS','lead','published',2),
  ('Nayan Mapara','HEAD OF TECHNOLOGY','TECHNICAL DIRECTOR','Oversees workshop content, AWS labs, and hands-on learning.','NM','lead','published',3),
  ('Alshifa Belim','HEAD OF COMMUNITY','COMMUNICATIONS','Manages social channels, member outreach, and community engagement.','AB','lead','published',4),
  ('Riya Vohra','HEAD OF WORKSHOPS','WORKSHOP LEAD','Designs and runs workshop sessions, from curriculum to hands-on labs.','RV','lead','published',5),
  ('Abhijot Kaur','HEAD OF OUTREACH','OUTREACH LEAD','Builds partnerships beyond Sheridan — sponsors, speakers, and outreach.','AK','lead','published',6)
) as v
where not exists (select 1 from team_members);

insert into highlights (title, description, status, sort_order)
select * from (values
  ('Keynote & Talks','Sessions on cloud careers, AWS services, and student success stories.','published'::content_status,1),
  ('Hands-on Labs','Guided workshops where students build and deploy real projects on AWS.','published',2),
  ('Networking','Connect with peers, club leaders, and professionals in the AWS ecosystem.','published',3),
  ('Swag & Prizes','Activities, challenges, and giveaways throughout the day.','published',4)
) as v
where not exists (select 1 from highlights);

-- ACTION REQUIRED: verify these four numbers before launch. They match the
-- current prototype; edit them at /admin/stats if any are wrong.
insert into stats (value, label, status, sort_order)
select * from (values
  ('7+',   'WORKSHOPS RUN',        'published'::content_status, 1),
  ('700+', 'MEMBERS',              'published', 2),
  ('2+',   'COMMUNITY EVENTS',     'published', 3),
  ('20+',  'AWS SERVICES COVERED', 'published', 4)
) as v
where not exists (select 1 from stats);

insert into faqs (question, answer, status, sort_order)
select * from (values
  ('Is Community Day free to attend?','Yes — completely free for all Sheridan College students.','published'::content_status,1),
  ('Who can attend?','Any Sheridan College student, from complete beginners to experienced builders. All skill levels welcome.','published',2),
  ('Do I need an AWS account?','No account needed to register. We''ll help you set one up if a session requires it.','published',3),
  ('Should I bring a laptop?','Yes — bring a charged laptop for the hands-on labs and the AWS Jam.','published',4),
  ('Is it in person or virtual?','In person, at Sheridan College''s Hazel McCallion Campus in Mississauga.','published',5),
  ('Do I need to register in advance?','Yes — seats are limited, so reserve your spot on Luma ahead of time.','published',6)
) as v
where not exists (select 1 from faqs);

-- ---------------------------------------------------------------------------
-- AFTER RUNNING THIS
-- 1. Auth → Providers → enable Google.
-- 2. Sign in once with the club Google account.
-- 3. Promote the three owners (must be done in SQL — the app cannot bootstrap
--    itself, and nobody can change their own role):
--
--      update profiles set role = 'owner', active = true
--       where email in ('neel@...', 'nayan@...', 'sohel@...');
--
--    Then the remaining leads:
--      update profiles set role = 'program',      active = true where email in ('riya@...');
--      update profiles set role = 'comms',        active = true where email = 'alshifa@...';
--      update profiles set role = 'partnerships', active = true where email = 'abhijot@...';
--
--    Everyone else who signs in stays 'pending' + inactive and sees nothing.
-- ---------------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- New sign-ins are 'pending' AND inactive: no read access, no write access.
  -- An owner must promote them from /admin/users before anything is visible.
  insert into profiles (id, display_name, email, role, active)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    'pending',
    false
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Trigger functions run in the trigger's context; no role needs EXECUTE.
revoke all on function private.touch_updated_at()  from public;
revoke all on function private.write_audit()       from public;
revoke all on function private.guard_role_change() from public;
revoke all on function private.handle_new_user()   from public;
