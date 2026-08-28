# Deploy to Vercel

The repo is already on GitHub and linked to Vercel — every `git push` to `main`
deploys automatically. This doc covers environment variables, first-time
Google login setup, and how to verify a deploy.

---

## Environment variables

Vercel → Project → Settings → Environment Variables:

| Name | Value | Needed for |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | your production URL | correct sitemap, OG tags |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role | nightly backups, Luma sync |
| `CRON_SECRET` | any long random string | protects the two cron routes |
| `ALLOWED_EMAIL_DOMAINS` | e.g. `sheridancollege.ca` | restricts who can reach login |
| `LUMA_API_KEY`, `LUMA_EVENT_ID` | optional | live registration count |

Until `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` are set, the two cron
routes return 401/503 instead of failing — everything else works.

The Supabase URL and anon key are compiled in as fallbacks (both are public
by design; row-level security is the boundary), so a fresh clone builds even
without `.env.local`.

## Google login

1. Supabase → **Authentication → Providers → Google** → enable, and paste a
   Google Cloud OAuth client ID + secret.
2. Supabase → **Authentication → URL Configuration** → add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://<your-vercel-domain>/auth/callback`

## Promoting new team members

Anyone who signs in lands on "Access pending" and does nothing until an
owner promotes them — from `/admin/users`, not SQL. Set their role, then
click Activate.

---

## Verify a deploy

| Check | Expect |
| --- | --- |
| `/` | Hero, countdown, stats, agenda, FAQs |
| `/team` | Team members render |
| `/admin` in a private window | redirects to `/login` |
| `/robots.txt` | disallows `/admin`, `/login`, `/api` |

---

## One Vercel Hobby note

Hobby allows 2 cron jobs at once-daily — exactly what `vercel.json` declares.
Hobby is also non-commercial: a student club event is fine, but if you ever take
paid sponsorship through the site, review the terms or move to a Pro account.
