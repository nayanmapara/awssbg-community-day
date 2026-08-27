# AWS Community Day @ Sheridan College

Production Next.js app for the AWS Student Builder Group's Community Day —
public event site plus a private admin dashboard, backed by Supabase, deployed
on Vercel.

Built for **Nayan Mapara** (Head of Technology) to run and deploy.

---

**Deploying? See [DEPLOY.md](./DEPLOY.md).** It needs no environment variables
for the first build.

---

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router, TypeScript) | Server Components + Server Actions, no separate API server |
| Database | Supabase Postgres | Real relations, row-level security, free tier |
| Auth | Supabase Auth (Google OAuth) | No passwords to share, per-person revocation |
| Files | Supabase Storage | Headshots, logos, gallery photos |
| Hosting | Vercel (region `iad1`) | Static public pages, serverless actions, cron |
| Styling | Inline styles + `lib/tokens.ts` | Matches the approved prototypes exactly, zero CSS build |
| QR | `html5-qrcode` (dynamic import) | Camera scanning at the door |

No Tailwind, no CSS-in-JS runtime, no state library. Five dependencies total.

---

## Status: the database is already built

The Supabase project is **live and fully migrated** — you do not need to run
`supabase-schema.sql` (it is kept as a reference and for rebuilding from
scratch).

| | |
| --- | --- |
| Project ref | `ssuzhrvdtpakzbwsvlch` |
| Region | Canada Central (`ca-central-1`) |
| URL | `https://ssuzhrvdtpakzbwsvlch.supabase.co` |
| Migrations applied | 8 (`01_enums_and_profiles` → `08_repoint_policies…`) |
| Security advisors | **0 warnings** |

Already in place: 14 tables, all RLS policies, audit triggers, the
`guard_role_change` protections, four storage buckets, the `public_agenda`
view, and live seed data — 11 agenda sessions, 6 leads, 4 highlights, 4 stats,
6 FAQs.

## Setup (about 15 minutes)

### 1. Install

```bash
npm install
cp .env.local.example .env.local
```

`.env.local.example` already contains the real project URL and anon key. You
only need to paste the **service_role** key (Supabase → Settings → API) and
invent a `CRON_SECRET`.

### 2. What the schema file is for

`supabase-schema.sql` is the single-file version of all 8 migrations, kept so
the whole stack can be rebuilt in a fresh project. **Do not run it against the
live project** — it is already applied. It creates:

- 13 tables + enums, with `status` and `sort_order` on all content
- Row-level security: public reads `published` only; writes are role-scoped
- Audit triggers on every content table (nothing can bypass the log)
- A check constraint that **physically blocks** publishing a speaker without a
  bio and headshot
- Storage buckets `headshots` (2 MB), `logos` (1 MB), `gallery` (5 MB)
- The `public_agenda` view
- Your current site content as seed data

Then create one more bucket by hand for the nightly backup:
**Storage → New bucket → `backups` → Private.**

### 4. Enable Google login

1. **Authentication → Providers → Google → Enable**
2. Create an OAuth client in Google Cloud Console; add Supabase's callback URL
   as an authorised redirect URI (Supabase shows it on that page).
3. **Authentication → URL Configuration** → add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

### 5. Fill `.env.local`

Copy from **Supabase → Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server only — never NEXT_PUBLIC_
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=<any long random string>
```

The anon key is safe in the browser: RLS is what protects the data, and it only
ever exposes `status = 'published'` rows. The **service role key bypasses RLS**
— it is used only by the two cron routes and must never be prefixed
`NEXT_PUBLIC_`.

### 6. Make yourself the owner

```bash
npm run dev
```

Visit `/login` and sign in with Google once. A trigger creates your profile
with role `program`. Promote yourself in the SQL Editor:

```sql
update profiles set role = 'owner' where email = 'you@example.com';
```

Then have each lead sign in once and assign their role from
**/admin/users** — or in SQL:

```sql
-- three owners
update profiles set role = 'owner', active = true
 where email in ('neel@…', 'nayan@…', 'sohel@…');

-- three admins: everything except user management and hard deletes
update profiles set role = 'admin', active = true
 where email in ('riya@…', 'alshifa@…', 'abhijot@…');
```

`program`, `comms`, `partnerships` and `volunteer` stay available for helpers
you bring on later — including day-of door volunteers, who should get
`volunteer` so they see nothing but check-in.

### 7. Deploy

```bash
git init && git add -A && git commit -m "Initial commit"
gh repo create aws-community-day --private --source=. --push
```

On Vercel: **Add New → Project → import the repo**, then

1. Add every variable from `.env.local` (set `NEXT_PUBLIC_SITE_URL` to the
   production domain).
2. Deploy.
3. Add the production `/auth/callback` URL to Supabase redirect URLs.
4. Cron jobs register automatically from `vercel.json`.

---

## How publishing works

Public pages are **statically rendered** and revalidated on demand:

- Every content page exports `revalidate = 3600` as a safety net.
- Saving or publishing a record calls `revalidatePath()` for only the affected
  paths (`lib/collections.ts` → `revalidate: ['/']`).
- A change is live in **about two seconds with no redeploy**, so the agenda can
  safely be edited during the event itself.

Three things deliberately read **live** instead:

| What | Why |
| --- | --- |
| Announcement banner | Day-of room changes must be instant (also subscribes to Postgres realtime) |
| Live agenda mode | Clock-driven, computed in the browser |
| Countdown | Ticks every second client-side |

---

## Roles

Enforced twice: in the UI, and again by Postgres RLS. Hiding a button is not
security — the policies are.

| Role | Person | Can touch |
| --- | --- | --- |
| `pending` | **every new sign-in** | **Nothing.** Default for all new accounts |
| `owner` | **Neel, Nayan, Sohel** | Everything, incl. users and hard deletes |
| `admin` | **Riya, Alshifa, Abhijot** | All content + publishing, no user management |
| `program` | future helpers | Agenda, speakers |
| `comms` | future helpers | Announcements, gallery, FAQ, highlights, stats, team |
| `partnerships` | future helpers | Sponsors, speakers (drafts need owner approval) |
| `volunteer` | Door helpers | Check-in only — nothing else renders |

Editors **archive**; only owners can hard-delete. Set `active = false` on a
profile to revoke access instantly.

Three owners means no single point of failure if someone is unreachable during
the event — but it also means three accounts that can delete data. Use `admin`
for anyone who does not need that.

---

## Security model

Read this before launch.

### The important default
**Every new Google sign-in is created as `pending` and `active = false`** by the
`handle_new_user` trigger. Signing in grants *nothing* — no reads, no writes.
An owner must promote the account from `/admin/users`. This is deliberate: an
earlier draft defaulted new users to `program`, which would have handed agenda
and speaker write access to anyone with a Google account. Do not change that
default.

### Layers
1. **Edge middleware** — `/admin/*` requires a session before any HTML is sent.
2. **Server guards** — `requireProfile()` / `requireSection()` re-check on every
   request; `pending` and deactivated accounts are treated as logged out.
3. **Row-level security** — the real boundary. Every policy calls `has_role()`,
   so a stolen anon key or a hand-crafted request still cannot read a draft or
   write a row. Hiding a button is not security; these policies are.
4. **Server Actions** — all mutations run server-side and call `guard()` first.
   No table is writable from the browser.

### Specific protections
| Risk | Mitigation |
| --- | --- |
| Privilege escalation | `guard_role_change` trigger blocks changing your own role, and blocks demoting the last owner |
| Anon key leaking data | RLS exposes only `status = 'published'`; drafts, check-ins, profiles and the audit log are invisible to `anon` |
| Service-role key exposure | Used only in the two cron routes; never prefixed `NEXT_PUBLIC_` |
| Cron endpoints being hit publicly | Both require `Authorization: Bearer $CRON_SECRET` |
| Audit tampering | `revoke update, delete on audit_log`; inserts happen only inside a `SECURITY DEFINER` trigger |
| Incomplete content going live | DB check constraint blocks publishing a speaker without bio + headshot |
| Early speaker leaks | `announce_at` is enforced in the RLS policy, not the UI, so it cannot be scraped early |
| Attendee PII | `checkins` has no anon policy at all — names never reach the public site |
| Open redirect on login | `/auth/callback` only accepts internal `next` paths |
| Outsiders reaching login | Optional `ALLOWED_EMAIL_DOMAINS` gate, plus the `pending` default behind it |
| XSS / clickjacking | CSP, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, HSTS in `next.config.mjs` |
| Camera abuse | `Permissions-Policy: camera=(self)` — only our own origin may open it |
| Admin pages cached | `/admin/*` sends `no-store` and `noindex` |
| Duplicate check-ins | Unique index on `ticket_code` |

### Verified on the live project
Ran as the `anon` role against production, with a draft row planted first:

| Query | Result |
| --- | --- |
| `select count(*) from stats` | 4 (published only) |
| `… where status = 'draft'` | **0** |
| `select count(*) from checkins` | **0** |
| `select count(*) from profiles` | **0** |
| `select count(*) from audit_log` | **0** |

Supabase security advisors: **0 warnings.**

### Launch checklist
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel only, never committed
- [ ] `CRON_SECRET` is a long random string
- [ ] `ALLOWED_EMAIL_DOMAINS` set to your real college domains
- [ ] All six leads signed in once and promoted; any stranger left `pending`
- [ ] Confirm the four numbers at `/admin/stats` are accurate
- [ ] Verify `/admin` redirects to `/login` in a private window
- [ ] Confirm a `pending` account sees the "Access pending" screen and no data

---

## Project layout

```
app/
  page.tsx                     Home — hero, countdown, agenda, gallery, sponsors, FAQ, map
  speakers/  team/  members/   Public pages
  login/                       Google sign-in
  auth/callback/               OAuth code exchange
  auth/signout/
  admin/
    layout.tsx                 Sidebar + publish bar; computes the pending-change diff
    stats/  (via [collection]) Editable home-page numbers
    page.tsx                   Dashboard: KPIs, readiness checks, recent activity
    [collection]/page.tsx      ONE generic screen serving 9 collections  ← rename me
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

### Adding a new editable section

1. Add one entry to `COLLECTIONS` in `lib/collections.ts`.
2. Add `app/admin/<key>/page.tsx` — three lines wrapping `<CollectionScreen>`.
3. Add the table + RLS policy in SQL, and a read in `lib/queries.ts`.

You get a working table, drawer form, reorder, publish and archive with no new
components.

---

## Notable implementation details

**Agenda flight path** (`components/site/AgendaFlightPath.tsx`) — the rocket
tracks whichever session is at the viewport centre and highlights it. Between
the first `starts_at` and last `ends_at` it switches to **LIVE mode** and parks
on the session actually happening, ignoring scroll. Below 720px the rail moves
to the left edge and cards stack on one side.

**Offline check-in** (`components/admin/CheckinConsole.tsx`) — scans are pushed
to a `localStorage` queue first and drained by an effect, so a dropped
connection in a packed room never stalls the door. Duplicate tickets are caught
by a unique index and reported as "Already checked in". The scanner debounces
repeat decodes for 3 seconds and vibrates on success.

**Scroll reveal** (`components/site/Reveal.tsx`) — IntersectionObserver plus a
hard 2.5s fallback timer, so content can never be stranded invisible if the
observer fails in an unusual viewport.

**QR payload** — accepts either a bare ticket code or JSON:
`{"name":"Jane Doe","code":"ABC123"}`. If you generate your own passes, use the
JSON form so the name appears in the log.

**Speaker reveal scheduling** — set `announce_at` and RLS hides the speaker from
the public until that moment. No cron needed; the policy does it.

---

## Commands

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
```

---

## Two Vercel free-tier limits

1. **Cron:** Hobby allows 2 jobs, once per day each — exactly what
   `vercel.json` uses. For an hourly registration refresh, trigger it from the
   dashboard or upgrade to Pro.
2. **Hobby terms are non-commercial.** A student club event is fine. If you
   ever take paid sponsorship through the site, review the terms or move the
   project to a Pro account.

---

## Handover checklist for next year's exec

- [ ] Supabase, Vercel and the domain all sit on the **club** Google account
- [ ] At least two people hold `owner`
- [ ] Nightly backups landing in the `backups` bucket
- [ ] Graduating leads set to `active = false`
- [ ] To reset for 2027: update `event_settings`, archive old speakers and
      gallery items, keep agenda structure as a template

---

## Design reference

The approved HTML prototypes live one level up in the project and are the
visual source of truth:

- `index.dc.html` — home page
- `team.dc.html`, `speakers.dc.html`, `members.dc.html` — public pages
- `Admin.dc.html` — the admin dashboard (clickable, mock data)
- `Backend Plan.dc.html` — architecture rationale

These are **references**, not code to copy. This Next.js app is the real
implementation; every colour, size and interaction has already been carried
across from them into `lib/tokens.ts` and the components.
