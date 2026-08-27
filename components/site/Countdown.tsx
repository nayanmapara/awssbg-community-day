'use client';
import { useEffect, useState } from 'react';
import { c } from '@/lib/tokens';

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

export function Countdown({ startsAt, endsAt }: { startsAt: string; endsAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();

  // Render nothing time-dependent on the server to avoid hydration drift.
  if (now === null) return <div style={{ minHeight: 132 }} />;

  if (now >= start && now <= end) {
    return (
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 }}>
          HAPPENING NOW
        </span>
        <div style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, marginTop: 12 }}>
          Community Day is live
        </div>
      </div>
    );
  }

  if (now > end) {
    return (
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 }}>
          THAT&apos;S A WRAP
        </span>
        <div style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, marginTop: 12 }}>
          Thanks for building with us
        </div>
      </div>
    );
  }

  const diff = start - now;
  const parts = [
    { v: pad(Math.floor(diff / 86400000)), l: 'DAYS' },
    { v: pad(Math.floor((diff % 86400000) / 3600000)), l: 'HOURS' },
    { v: pad(Math.floor((diff % 3600000) / 60000)), l: 'MINS' },
    { v: pad(Math.floor((diff % 60000) / 1000)), l: 'SECS' },
  ];

  const label = new Date(startsAt).toLocaleDateString('en-CA', { month: 'long', day: 'numeric' });

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 }}>
          COUNTING DOWN TO {label.toUpperCase()}
        </span>
      </div>
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,minmax(58px,1fr))',
          maxWidth: 540, margin: '0 auto', gap: 12,
        }}
      >
        {parts.map((p) => (
          <div key={p.l} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '20px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: c.textBright }}>{p.v}</div>
            <div style={{ fontSize: 11, color: c.muted, letterSpacing: '0.08em', marginTop: 6 }}>{p.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
