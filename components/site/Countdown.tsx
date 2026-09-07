'use client';
import { useEffect, useRef, useState } from 'react';
import { c } from '@/lib/tokens';
import { missionCopy } from '@/lib/mission-theme';
import { MissionRocket } from '@/components/site/MissionRocket';

const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

function MissionKicker({ children, direction = 'up' }: { children: React.ReactNode; direction?: 'up' | 'down' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
      <MissionRocket size={16} direction={direction} />
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
        <MissionKicker direction="up">{missionCopy.countdown.live}</MissionKicker>
        <div className="countdown-live" style={{ fontSize: 'clamp(24px,4vw,38px)', fontWeight: 800, marginTop: 12 }}>
          Community Day is live
        </div>
      </div>
    );
  }

  if (now > end) {
    return (
      <div className={className} style={{ textAlign: 'center' }}>
        <MissionKicker direction="up">{missionCopy.countdown.complete}</MissionKicker>
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
        <MissionKicker direction="up">{missionCopy.countdown.pre(label)}</MissionKicker>
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
