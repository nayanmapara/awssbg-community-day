import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth redirect target. Exchanges the code for a session cookie, then applies
 * an optional email-domain allowlist as a second gate in front of RLS.
 *
 * Defence in depth: even if this check were bypassed, a new profile is created
 * as 'pending' + inactive by the database trigger, so it still has no access.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/admin';

  // Only allow internal redirects — blocks open-redirect abuse of this route.
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/admin';

  if (!code) return NextResponse.redirect(`${origin}/login?error=missing_code`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
  }

  const allowed = (process.env.ALLOWED_EMAIL_DOMAINS ?? '')
    .split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);

  if (allowed.length > 0) {
    const email = data.user?.email?.toLowerCase() ?? '';
    const domain = email.split('@')[1] ?? '';
    if (!allowed.includes(domain)) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?denied=domain`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
