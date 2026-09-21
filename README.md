# AWS Community Day @ Sheridan College

This is the site for the AWS Student Builder Group's Community Day at Sheridan —
the public event pages plus a private admin dashboard we use to run everything
leading up to and during the day. Next.js on Vercel, Supabase for the database
and auth.

Deploying it? Start with [DEPLOY.md](./DEPLOY.md) — the first build doesn't
need any env vars.

## Stack

Next.js 15 with the App Router, TypeScript, Server Components and Server
Actions so there's no separate API layer to maintain. Supabase for Postgres,
auth (Google OAuth), and file storage — it's free at our scale and row-level
security means the database itself enforces who can see what, not just the
UI. Hosted on Vercel in `iad1`.

Styling is inline styles plus a `lib/tokens.ts` file rather than Tailwind or
any CSS-in-JS — it matches the approved design prototypes exactly and there's
no CSS build step to think about. QR scanning at check-in uses
`html5-qrcode`, loaded dynamically so it doesn't bloat the main bundle.
That's basically the whole dependency list — five packages, no state library.

## The database is already live

The Supabase project is running in production already, fully migrated. You
don't need to run `supabase-schema.sql` — that file is just a flattened,
single-file version of the 8 migrations, kept around in case we ever need to
rebuild from scratch. Don't run it against the live project.

Project ref `ssuzhrvdtpakzbwsvlch`, Canada Central region. It's got 14 tables,
RLS on all of them, audit triggers, the `guard_role_change` protections, four
storage buckets, and real seed data (11 agenda sessions, 6 leads, 4
highlights, 4 stats, 6 FAQs). Security advisors come back clean — 0 warnings.

## Getting set up (~15 min)

Install and copy the env file:

```bash
npm install
cp .env.local.example .env.local
```

`.env.local.example` already has the real project URL and anon key filled
in. You just need to grab the **service_role** key from Supabase (Settings →
API) and make up a `CRON_SECRET`.

If you do ever need to rebuild the schema from scratch, `supabase-schema.sql`
creates all 13 tables/enums with `status` + `sort_order` on every content
table, RLS (public only ever sees `published` rows), audit triggers on
everything, a check constraint that physically blocks publishing a speaker
without a bio and headshot, the storage buckets (`headshots` 2MB, `logos`
1MB, `gallery` 5MB), and the `public_agenda` view. You'd also need to add one
more bucket by hand: **Storage → New bucket → `backups` → Private** — that's
for the nightly backup cron and isn't in the SQL file.

**Google login** — enable it under Authentication → Providers → Google, then
create an OAuth client in Google Cloud Console and add Supabase's callback
URL as an authorized redirect. Under Authentication → URL Configuration, add
both `http://localhost:3000/auth/callback` and your production callback URL.

**Fill in `.env.local`** with values from Supabase → Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server only — never NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=<any long random string>
```

The anon key is fine to expose in the browser — RLS is the actual boundary,
and it only ever returns `published` rows. The service role key bypasses RLS
entirely, so it's only used in the two cron routes and should never end up
prefixed `NEXT_PUBLIC_`.

**Make yourself the owner.** Run `npm run dev`, sign in with Google once at
`/login`. A trigger creates your profile as `program` by default. Bump
yourself to owner in the SQL editor:

```sql
update profiles set role = 'owner' where email = 'you@example.com';
```

Then get everyone else to sign in once and assign roles from
`/admin/users`, or do it in SQL — three owners, three admins, whatever split
makes sense. `program`, `comms`, `partnerships` and `volunteer` are there for
helpers who join later; door volunteers on event day should get `volunteer`
so they only see check-in.

**Deploying:**

```bash
git init && git add -A && git commit -m "Initial commit"
gh repo create aws-community-day --private --source=. --push
```

Import the repo on Vercel, add every var from `.env.local` (with
`NEXT_PUBLIC_SITE_URL` pointing at the real domain), deploy, then add the
production `/auth/callback` URL to Supabase's redirect list. Cron jobs
register automatically from `vercel.json`.

## How publishing works

Public pages are statically rendered with `revalidate = 3600` as a fallback,
but saving or publishing something calls `revalidatePath()` for just the
affected paths, so changes usually show up within a couple seconds — no
redeploy needed. That's important because we edit the agenda live during the
event.

A few things intentionally read live instead of from the static cache: the
announcement banner (needs to be instant for room changes, subscribes to
Postgres realtime), live agenda mode (tracks the clock), and the countdown.

## Roles

Every permission is checked twice — once in the UI (so people don't even see
buttons they can't use) and again by Postgres RLS, which is the part that
actually matters. Hiding a button isn't security.

New sign-ins default to `pending` and can't touch anything until an owner
promotes them. Owners (Neel, Nayan, Sohel) can do everything including
managing users and hard deletes. Admins (Riya, Alshifa, Abhijot) can touch
all content and publish, just not manage users. Below that, `program`,
`comms`, `partnerships`, and `volunteer` are scoped to specific sections for
future helpers — `volunteer` only sees check-in.

Regular editors can only archive records; hard delete is owner-only, and
setting `active = false` on a profile revokes access immediately. We
deliberately have three owners so there's no single point of failure if
someone's unreachable during the event, but that's also three accounts that
can delete things — use `admin` for anyone who doesn't specifically need
that power.

## Security

Worth reading before launch, not after something goes wrong.

The important default: every new Google sign-in starts as `pending` with
`active = false`, set by the `handle_new_user` trigger. Signing in grants
nothing on its own — an owner has to promote the account from
`/admin/users`. An earlier version of this defaulted new users to `program`,
which would've handed out agenda/speaker write access to literally anyone
with a Google account. Don't change that default back.

There are four layers: edge middleware blocks `/admin/*` before any HTML
ships if there's no session; server guards (`requireProfile()`,
`requireSection()`) re-check on every request and treat `pending`/deactivated
accounts as logged out; row-level security is the real backstop — every
policy calls `has_role()`, so even a leaked anon key or a hand-crafted
request can't read a draft or write a row; and all mutations go through
Server Actions that call `guard()` first, so nothing is writable directly
from the browser.

Some specifics: a `guard_role_change` trigger stops you from changing your
own role or demoting the last owner. The anon key only ever sees
`published` rows — drafts, check-ins, profiles, and the audit log are
invisible to it. The service-role key only lives in the two cron routes. Both
cron endpoints require `Authorization: Bearer $CRON_SECRET`. The audit log
table revokes `update`/`delete` entirely, so entries can only be inserted by
a `SECURITY DEFINER` trigger — nothing can edit history after the fact. A DB
check constraint blocks publishing a speaker without a bio and headshot.
Speaker `announce_at` is enforced in the RLS policy itself, not the UI, so
early announcements can't be scraped by hitting the API directly. Attendee
check-in data has no anon policy at all, so names never reach the public
site. `/auth/callback` only accepts internal `next` paths, so it can't be
used as an open redirect. There's an optional `ALLOWED_EMAIL_DOMAINS` gate on
top of the `pending` default. `next.config.mjs` sets CSP, `X-Frame-Options:
DENY`, `frame-ancestors 'none'`, `nosniff`, and HSTS. Camera access is
locked to our own origin via `Permissions-Policy`. Admin pages send
`no-store` and `noindex`. `ticket_code` has a unique index so nobody can be
checked in twice.

I ran a set of queries as the `anon` role directly against production (with
a draft row planted first) to confirm the policies actually hold: draft rows
returned zero, check-ins zero, profiles zero, audit log zero, and the stats
table only returned the 4 published rows. Advisors: 0 warnings.

Before launch:
- `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel only, never committed
- `CRON_SECRET` is a long random string
- `ALLOWED_EMAIL_DOMAINS` is set to the real college domains
- everyone who needs access has signed in once and been promoted; anyone
  else is still `pending`
- the numbers on `/admin/stats` are accurate
- `/admin` redirects to `/login` in a private window
- a `pending` account sees "access pending" and nothing else

## Project layout

```
app/
  page.tsx                     Home — hero, countdown, agenda, gallery, sponsors, FAQ, map
  speakers/  team/            Public pages (team includes members)
  login/                       Google sign-in
  auth/callback/               OAuth code exchange
  auth/signout/
  admin/
    layout.tsx                 Sidebar + publish bar; computes the pending-change diff
    stats/  (via [collection]) Editable home-page numbers
    page.tsx                   Dashboard: KPIs, readiness checks, recent activity
    [collection]/page.tsx      one generic screen serving 9 collections
    settings/  checkin/  activity/
  api/cron/luma-sync/          Daily registration count from Luma
  api/cron/backup/             Nightly JSON snapshot to Storage
components/
  site/     Nav, Footer, Countdown, AgendaFlightPath, CnTower, FaqList,
            TiltCard, Reveal, AnnouncementBanner, GridBackdrop, ConsoleEgg
  admin/    Sidebar, PublishBar, CollectionScreen, CollectionTable,
            RecordDrawer, SettingsForm, CheckinConsole, QrScanner
lib/
  collections.ts  Field/column specs — the single source of truth for the admin
  actions.ts      Server Actions (upsert, status, reorder, publishAll, checkIn)
  queries.ts      Public reads
  auth.ts         Role map + server guards
  tokens.ts       Design tokens
  types.ts        Database types
```

Adding a new editable section is three steps: add an entry to `COLLECTIONS`
in `lib/collections.ts`, add a three-line `app/admin/<key>/page.tsx`
wrapping `<CollectionScreen>`, and add the table + RLS policy in SQL plus a
read in `lib/queries.ts`. That gets you a full table, drawer form, reorder,
publish and archive with no new components to write.

## A few implementation notes

The agenda flight path (`components/site/AgendaFlightPath.tsx`) tracks
whatever session is centered in the viewport and highlights it as you
scroll. Once we're between the first session's start and the last one's end,
it switches into live mode and just tracks whatever's actually happening,
ignoring scroll position. Under 720px the rail moves to the left edge and
cards stack.

Check-in (`components/admin/CheckinConsole.tsx`) queues scans in
`localStorage` first and drains them in the background, so a dropped
connection at the door doesn't stall the line. Duplicate scans get caught by
a unique index and reported as "already checked in." The scanner debounces
repeat reads for 3 seconds and vibrates on a successful scan. It'll accept
either a bare ticket code or a JSON payload like
`{"name":"Jane Doe","code":"ABC123"}` — use the JSON form if you're
generating your own passes so names show up in the log.

Scroll reveal (`components/site/Reveal.tsx`) uses an IntersectionObserver
with a hard 2.5s fallback timer, so nothing gets stuck invisible if the
observer misbehaves on some unusual viewport.

Speaker reveal scheduling just sets `announce_at` on the record — RLS hides
it from the public until that timestamp passes, no cron job required.

## Commands

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

## Vercel free tier, two things to know

Hobby cron only allows 2 jobs once a day each, which is exactly what
`vercel.json` uses — if you want hourly registration syncs you'll need to
trigger it manually or move to Pro. Also, Hobby's terms are non-commercial;
a student club event is fine, but if the site ever takes paid sponsorship
directly, check the terms or move to a paid plan.

## Handing this off next year

Make sure Supabase, Vercel, and the domain all live on the club's Google
account, not a personal one. Keep at least two people on `owner`. Check that
nightly backups are actually landing in the `backups` bucket. Set graduating
leads to `active = false`. To reset for next year: update
`event_settings`, archive old speakers and gallery items, and keep the
agenda structure as a template rather than starting from scratch.

## Design reference

The approved HTML prototypes live one directory up and are the visual source
of truth — `index.dc.html`, `team.dc.html`, `speakers.dc.html`,
`members.dc.html`, `Admin.dc.html` (clickable, mock data), and `Backend
Plan.dc.html` for the architecture rationale. They're references, not code
to copy — this app is the real implementation, and every color, size and
interaction from them has already been carried over into `lib/tokens.ts` and
the components.
