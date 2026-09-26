'use client';

import { useState, useTransition } from 'react';
import { submitBuilderProfile } from '@/lib/builder-profiles';
import { c } from '@/lib/tokens';

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: c.panel,
  border: `1px solid ${c.border}`,
  color: c.textBright,
  padding: '12px 14px',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.06em',
  color: c.muted,
  marginBottom: 8,
};

export function BuilderProfileForm() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitBuilderProfile({ email, displayName });
      if (result.ok) {
        setDone(true);
        setEmail('');
        setDisplayName('');
      } else {
        setError(result.error);
      }
    });
  };

  if (done) {
    return (
      <div
        style={{
          background: c.card,
          border: `1px solid ${c.border}`,
          padding: 'clamp(24px,4vw,40px)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 13, color: c.accent, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 12 }}>
          RECORDED
        </div>
        <p style={{ margin: 0, color: c.text, fontSize: 16, lineHeight: 1.6 }}>
          Thanks - your details are saved.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          style={{
            marginTop: 24,
            background: 'transparent',
            border: `1px solid ${c.border}`,
            color: c.muted,
            padding: '10px 18px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.05em',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          SUBMIT ANOTHER
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: c.card,
        border: `1px solid ${c.border}`,
        padding: 'clamp(24px,4vw,40px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        maxWidth: 520,
      }}
    >
      <div>
        <label htmlFor="bp-name" style={labelStyle}>NAME</label>
        <input
          id="bp-name"
          name="displayName"
          type="text"
          required
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Jane Doe"
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="bp-email" style={labelStyle}>EMAIL</label>
        <input
          id="bp-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@sheridancollege.ca"
          style={fieldStyle}
        />
      </div>

      {error && (
        <p style={{ margin: 0, color: c.danger, fontSize: 13, lineHeight: 1.5 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          background: c.accent,
          color: c.bg,
          border: 'none',
          padding: '14px 20px',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.06em',
          cursor: pending ? 'wait' : 'pointer',
          opacity: pending ? 0.7 : 1,
          fontFamily: 'inherit',
        }}
      >
        {pending ? 'SAVING…' : 'SUBMIT'}
      </button>
    </form>
  );
}
