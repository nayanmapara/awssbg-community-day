#!/usr/bin/env bash
#
# Builds the git history for this project and pushes it to GitHub.
# Run once, from inside this folder. Requires git (and gh for repo creation).
#
#   chmod +x setup-git.sh && ./setup-git.sh
#
# ---------------------------------------------------------------------------
# DATES
# ---------------------------------------------------------------------------
# By default every commit is stamped with today's date, spaced a few minutes
# apart so the order is stable and the history is HONEST.
#
# Set SPREAD_DAYS to spread the commits backwards over that many days instead
# (e.g. SPREAD_DAYS=10 ./setup-git.sh). Only do that if it reflects when the
# work actually happened — inventing a history you did not have is
# misrepresentation, and it matters if this repo is ever coursework, a club
# record, or a portfolio piece someone checks.
set -euo pipefail

SPREAD_DAYS="${SPREAD_DAYS:-0}"
BRANCH="${BRANCH:-main}"
REPO_NAME="${REPO_NAME:-awssbg-community-day}"
VISIBILITY="${VISIBILITY:-private}"

TOTAL=15

if [ ! -f package.json ]; then
  echo "Run this from the project folder (package.json not found)." >&2
  exit 1
fi

if [ -d .git ]; then
  echo "This folder is already a git repo. Delete .git first to rebuild the history." >&2
  exit 1
fi

git init -q
git symbolic-ref HEAD "refs/heads/$BRANCH"

# Commit N of TOTAL gets a timestamp N steps along the chosen window.
stamp_for() {
  local n="$1"
  if [ "$SPREAD_DAYS" -eq 0 ]; then
    # Today, 09:00 + n*7 minutes.
    local mins=$(( 9 * 60 + n * 7 ))
    date -u -d "today 00:00 UTC +${mins} minutes" "+%Y-%m-%dT%H:%M:%S%z" 2>/dev/null \
      || date -u -v0H -v0M -v0S -v+${mins}M "+%Y-%m-%dT%H:%M:%S%z"
  else
    # Oldest commit SPREAD_DAYS ago, newest today, evenly spaced.
    local total_mins=$(( SPREAD_DAYS * 24 * 60 ))
    local back=$(( total_mins - (n * total_mins / TOTAL) ))
    date -u -d "${back} minutes ago" "+%Y-%m-%dT%H:%M:%S%z" 2>/dev/null \
      || date -u -v-${back}M "+%Y-%m-%dT%H:%M:%S%z"
  fi
}

commit() {
  local n="$1"; shift
  local msg="$1"; shift
  git add -- "$@" 2>/dev/null || true
  if git diff --cached --quiet; then
    echo "  (nothing staged, skipping: $msg)"
    return
  fi
  local ts
  ts="$(stamp_for "$n")"
  GIT_AUTHOR_DATE="$ts" GIT_COMMITTER_DATE="$ts" git commit -q -m "$msg"
  echo "  [$ts] $msg"
}

echo "Building history ($TOTAL commits)..."

commit 0 "chore: scaffold Next.js 15 + TypeScript project" 'package.json' 'tsconfig.json' 'next.config.mjs' 'vercel.json' '.gitignore' '.env.example'
commit 1 "feat(db): Supabase schema with row-level security and audit triggers" 'supabase-schema.sql'
commit 2 "feat(ui): design tokens and shared layout primitives" 'lib/tokens.ts' 'lib/types.ts' 'app/globals.css' 'app/layout.tsx' 'components/site/GridBackdrop.tsx' 'components/site/ChipLogo.tsx' 'components/site/Reveal.tsx' 'components/site/TiltCard.tsx'
commit 3 "feat(data): Supabase clients and public read layer" 'lib/supabase/config.ts' 'lib/supabase/server.ts' 'lib/supabase/client.ts' 'lib/queries.ts'
commit 4 "feat(site): home page with countdown, stats, gallery, sponsors and map" 'app/page.tsx' 'app/not-found.tsx' 'components/site/Nav.tsx' 'components/site/Footer.tsx' 'components/site/Countdown.tsx' 'components/site/CnTower.tsx' 'components/site/ConsoleEgg.tsx'
commit 5 "feat(site): agenda flight path with live event-day mode" 'components/site/AgendaFlightPath.tsx' 'components/site/FaqList.tsx'
commit 6 "feat(site): speakers, team and members pages" 'app/speakers/page.tsx' 'app/team/page.tsx' 'app/members/page.tsx'
commit 7 "feat(auth): Google OAuth with pending-by-default roles" 'lib/auth.ts' 'app/login/page.tsx' 'app/auth/callback/route.ts' 'app/auth/signout/route.ts' 'middleware.ts'
commit 8 "feat(admin): dashboard, sidebar and publish flow" 'lib/collections.ts' 'lib/actions.ts' 'app/admin/layout.tsx' 'app/admin/page.tsx' 'components/admin/Sidebar.tsx' 'components/admin/PublishBar.tsx'
commit 9 "feat(admin): generic collection editor across ten sections" 'components/admin/CollectionScreen.tsx' 'components/admin/CollectionTable.tsx' 'components/admin/RecordDrawer.tsx' 'app/admin/agenda' 'app/admin/speakers' 'app/admin/team' 'app/admin/sponsors' 'app/admin/highlights' 'app/admin/stats' 'app/admin/faqs' 'app/admin/gallery' 'app/admin/announcements' 'app/admin/users'
commit 10 "feat(admin): event settings and activity log" 'app/admin/settings' 'components/admin/SettingsForm.tsx' 'app/admin/activity'
commit 11 "feat(checkin): QR door check-in with offline queue" 'app/admin/checkin' 'components/admin/CheckinConsole.tsx' 'components/admin/QrScanner.tsx'
commit 12 "feat(ops): cron routes for Luma sync and nightly backups" 'app/api/cron/luma-sync/route.ts' 'app/api/cron/backup/route.ts'
commit 13 "feat(seo): robots, sitemap and metadata" 'app/robots.ts' 'app/sitemap.ts'
commit 14 "docs: setup, security model and deploy guide" 'README.md' 'DEPLOY.md' '.env.local.example'

# Anything not explicitly listed above (stray files, local additions).
git add -A
if ! git diff --cached --quiet; then
  ts="$(stamp_for 15)"
  GIT_AUTHOR_DATE="$ts" GIT_COMMITTER_DATE="$ts" \
    git commit -q -m "chore: remaining project files"
  echo "  [$ts] chore: remaining project files"
fi

echo
git --no-pager log --pretty=format:"%h  %ad  %s" --date=short
echo
echo

# ---------------------------------------------------------------------------
# PUSH
# ---------------------------------------------------------------------------
if git remote get-url origin >/dev/null 2>&1; then
  echo "Pushing to existing origin..."
  git push -u origin "$BRANCH"
elif command -v gh >/dev/null 2>&1; then
  echo "Creating GitHub repo $REPO_NAME ($VISIBILITY) and pushing..."
  gh repo create "$REPO_NAME" "--$VISIBILITY" --source=. --push
else
  echo "No origin set and the GitHub CLI (gh) is not installed."
  echo "Create an empty repo at https://github.com/new, then run:"
  echo
  echo "  git remote add origin https://github.com/<you>/$REPO_NAME.git"
  echo "  git push -u origin $BRANCH"
  exit 0
fi

echo
echo "Done. Next: tell Claude the repo name and it will link Vercel and deploy."
