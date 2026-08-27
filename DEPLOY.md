# Deploy to Vercel

Everything is ready to build. **No renaming, no environment variables needed for
the first deploy** — the Supabase URL and anon key are compiled in as fallbacks
(both are public by design; row-level security is the boundary).

---

## Push to GitHub, then link Vercel

Run the included script from inside this folder:

```bash
chmod +x setup-git.sh
./setup-git.sh
```

It initialises the repo, builds a **15-commit history** grouped by milestone
(scaffold → schema → tokens → data layer → home page → agenda → public pages →
auth → admin → collection editor → settings → check-in → cron → SEO → docs),
then creates the GitHub repo and pushes. It refuses to run if `.git` already
exists, so it cannot clobber existing work.

Options:

```bash
REPO_NAME=my-repo ./setup-git.sh     # default: awssbg-community-day
VISIBILITY=public ./setup-git.sh     # default: private
SPREAD_DAYS=10 ./setup-git.sh        # see "Commit dates" below
```

If you have no `gh` CLI it stops after committing and prints the two commands
to add a remote and push.

### Commit dates
By default all commits are stamped **today**, seven minutes apart, so the order
is stable and the history is accurate.

`SPREAD_DAYS=n` spreads them backwards over *n* days instead. Only use it if
that matches when the work actually happened — a fabricated history is
misrepresentation, and it matters if this repo ends up as coursework, a club
record, or something an employer reads.

### On Windows
Run it from Git Bash (ships with Git for Windows), not PowerShell.

Then tell Claude **"the repo is pushed: <owner>/<repo>"** and it will create the
Vercel project, link it to that repo, and deploy. From then on every
`git push` deploys automatically — which is what you want for a site you edit
through the year.

### Or do it yourself in the dashboard
[vercel.com/new](https://vercel.com/new) → import the repo → Deploy. Framework
detection handles the rest; no build settings to change.

---

## After the first deploy

### 1. Add the remaining environment variables
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

### 2. Enable Google login
1. Supabase → **Authentication → Providers → Google** → enable, and paste a
   Google Cloud OAuth client ID + secret.
2. Supabase → **Authentication → URL Configuration** → add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://<your-vercel-domain>/auth/callback`

### 3. Promote the team
Each lead signs in once at `/login` (they will land on "Access pending"), then
in Supabase SQL Editor:

```sql
update profiles set role = 'owner', active = true
 where email in ('neel@…', 'nayan@…', 'sohel@…');

update profiles set role = 'admin', active = true
 where email in ('riya@…', 'alshifa@…', 'abhijot@…');
```

After that, owners manage everyone else from `/admin/users`.

---

## Verify the deploy

| Check | Expect |
| --- | --- |
| `/` | Hero, countdown, 4 stats, 11 agenda sessions, 6 FAQs |
| `/team` | 6 leads |
| `/speakers` | 6 radar placeholders (no speakers published yet) |
| `/admin` in a private window | redirects to `/login` |
| `/robots.txt` | disallows `/admin`, `/login`, `/api` |

---

## One Vercel Hobby note

Hobby allows 2 cron jobs at once-daily — exactly what `vercel.json` declares.
Hobby is also non-commercial: a student club event is fine, but if you ever take
paid sponsorship through the site, review the terms or move to a Pro account.
