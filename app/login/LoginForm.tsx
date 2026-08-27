'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { c } from '@/lib/tokens';

export function LoginForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) { setError(error.message); setBusy(false); }
  };

  return (
    <>
      <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 10px' }}>
        Sign in to the dashboard
      </h1>
      <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.6, margin: '0 0 26px' }}>
        Use your club Google account. Access is granted per person by a club owner.
      </p>

      <button
        onClick={signIn}
        disabled={busy}
        style={{
          width: '100%', background: c.accent, color: c.bg, border: 'none',
          padding: '13px 20px', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
          cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1,
        }}
      >
        {busy ? 'REDIRECTING…' : 'CONTINUE WITH GOOGLE'}
      </button>

      {error && (
        <p style={{ color: c.danger, fontSize: 12, marginTop: 16, lineHeight: 1.5 }}>
          {error}
        </p>
      )}
    </>
  );
}
