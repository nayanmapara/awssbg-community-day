import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { c } from '@/lib/tokens';
import { ChipLogo } from '@/components/site/ChipLogo';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

/**
 * Owns the whole signed-in-but-not-approved decision, so middleware never has
 * to guess. Middleware checks authentication; this page checks authorization.
 * That split is what prevents the /login <-> /admin redirect loop.
 */
export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let pending = false;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, active')
      .eq('id', user.id)
      .maybeSingle();

    const approved = !!profile && profile.active && profile.role !== 'pending';
    if (approved) redirect('/admin');
    pending = true;
  }

  return (
    <main
      style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24, background: c.bg,
        color: c.text, fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      }}
    >
      <div style={{ width: 'min(400px,100%)', background: c.bgAlt, border: `1px solid ${c.border}`, padding: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <ChipLogo size={26} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.06em' }}>SBG ADMIN</div>
            <div style={{ fontSize: 9, color: c.faint, letterSpacing: '0.06em', marginTop: 2 }}>
              COMMUNITY DAY 2026
            </div>
          </div>
        </div>

        {pending ? (
          <>
            <div style={{ fontSize: 10, letterSpacing: '0.08em', color: c.warn, fontWeight: 700, marginBottom: 12 }}>
              ACCESS PENDING
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px' }}>
              You&apos;re signed in as {user!.email}
            </h1>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.6, margin: '0 0 8px' }}>
              Your account exists but has no role yet, so there is nothing you can
              open. A club owner needs to approve you from{' '}
              <strong style={{ color: c.text }}>/admin/users</strong>.
            </p>
            <p style={{ color: c.faint, fontSize: 12, lineHeight: 1.6, margin: '0 0 26px' }}>
              Setting up for the first time? Promote yourself in the Supabase SQL
              editor, then reload this page.
            </p>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                style={{
                  width: '100%', background: 'none', border: `1px solid ${c.border}`,
                  color: c.muted, padding: '12px 20px', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.06em', cursor: 'pointer',
                }}
              >
                SIGN OUT
              </button>
            </form>
          </>
        ) : (
          <LoginForm />
        )}

        <p style={{ color: c.faint, fontSize: 11, marginTop: 22, lineHeight: 1.6 }}>
          Not a club lead? Head back to the <a href="/" style={{ color: c.accent }}>public site</a>.
        </p>
      </div>
    </main>
  );
}
