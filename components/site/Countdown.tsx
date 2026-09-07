'use client';
import { useEffect, useRef, useState } from 'react';
import { c } from '@/lib/tokens';
import { SbgIcon } from '@/components/site/SbgIcon';

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

function Kicker({ icon, children }: { icon?: 'Clock' | 'Bolt' | 'Trophy'; children: React.ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      {icon && (
        <SbgIcon
          name={icon}
          color={icon === 'Trophy' ? 'Amber' : icon === 'Bolt' ? 'Mint' : 'Blue'}
          size={18}
          animate="glow"
        />
      )}
      <span style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 }}>
        {children}
      </span>
    </div>
  );
}

function CountdownDigit({ value, label }: { value: string; label: string }) {
  const [tick, setTick] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    setTick(true);
    const t = setTimeout(() => setTick(false), 450);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className={`countdown-digit hover-panel${tick ? ' countdown-digit--tick' : ''}`} style={{ background: c.card, border: `1px solid ${c.border}`, padding: '24px 12px', textAlign: 'center' }}>
      <div className="countdown-digit__value" style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: c.textBright }}>{value}</div>
      <div style={{ fontSize: 11, color: c.muted, letterSpacing: '0.08em', marginTop: 8 }}>{label}</div>
    </div>
  );
}

export function Countdown({
  startsAt,
  endsAt,
  className,
}: {
  startsAt: string;
  endsAt: string;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();

  if (now === null) return <div className={className} style={{ minHeight: 132 }} />;

  if (now >= start && now <= end) {
    return (
      <div className={className} style={{ textAlign: 'center' }}>
        <Kicker icon="Bolt">HAPPENING NOW</Kicker>
        <div style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, marginTop: 12 }}>
          Community Day is live
        </div>
      </div>
    );
  }

  if (now > end) {
    return (
      <div className={className} style={{ textAlign: 'center' }}>
        <Kicker icon="Trophy">THAT&apos;S A WRAP</Kicker>
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
    <div className={className}>
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Kicker>COUNTING DOWN TO {label.toUpperCase()}</Kicker>
      </div>
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,minmax(58px,1fr))',
          maxWidth: 540, margin: '0 auto', gap: 12,
        }}
      >
        {parts.map((p) => (
          <CountdownDigit key={p.l} value={p.v} label={p.l} />
        ))}
      </div>
    </div>
  );
}
