'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { c, maxW, pad } from '@/lib/tokens';

export type LuckyDrawEntrant = {
  id: string;
  display_name: string;
};

type Phase = 'idle' | 'spinning' | 'winner';

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function LuckyDrawLaunch({ entrants }: { entrants: LuckyDrawEntrant[] }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [display, setDisplay] = useState<LuckyDrawEntrant | null>(null);
  const [winner, setWinner] = useState<LuckyDrawEntrant | null>(null);
  const timers = useRef<number[]>([]);
  const spinning = phase === 'spinning';

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const draw = () => {
    if (entrants.length === 0 || spinning) return;
    clearTimers();
    setWinner(null);
    setPhase('spinning');

    const chosen = pickRandom(entrants);

    if (prefersReducedMotion() || entrants.length === 1) {
      setDisplay(chosen);
      setWinner(chosen);
      setPhase('winner');
      return;
    }

    const totalMs = 4200;
    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= totalMs) {
        setDisplay(chosen);
        setWinner(chosen);
        setPhase('winner');
        return;
      }

      const progress = elapsed / totalMs;
      setDisplay(progress > 0.82 ? chosen : pickRandom(entrants));

      const nextTick = Math.min(220, 40 + progress * progress * 280);
      timers.current.push(window.setTimeout(tick, nextTick));
    };

    tick();
  };

  const empty = entrants.length === 0;

  return (
    <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `40px ${pad} 96px` }}>
      <div style={{ marginBottom: 28, maxWidth: 560 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700, marginBottom: 10 }}>
          LUCKY DRAW
        </div>
        <h1 style={{ margin: 0, fontSize: 'clamp(32px,5vw,48px)', fontWeight: 800, color: c.textBright }}>
          Who is next?
        </h1>
        <p style={{ margin: '12px 0 0', color: c.muted, fontSize: 15, lineHeight: 1.6 }}>
          {empty
            ? 'No names in the roster yet.'
            : `${entrants.length} name${entrants.length === 1 ? '' : 's'} ready.`}
        </p>
      </div>

      <div
        className={phase === 'winner' ? 'lucky-draw-stage lucky-draw-stage--win' : 'lucky-draw-stage'}
        style={{
          position: 'relative',
          background: c.card,
          border: `1px solid ${phase === 'winner' ? c.accent : c.border}`,
          padding: 'clamp(40px,8vw,72px) 28px',
          textAlign: 'center',
          overflow: 'hidden',
          maxWidth: 640,
        }}
      >
        {phase === 'winner' && <div className="lucky-draw-burst" aria-hidden />}

        <div style={{ fontSize: 11, letterSpacing: '0.1em', color: c.faint, fontWeight: 700, marginBottom: 16 }}>
          {phase === 'spinning' ? 'DRAWING…' : phase === 'winner' ? 'WINNER' : 'READY'}
        </div>

        <div
          key={display?.id ?? 'empty'}
          className={
            spinning ? 'lucky-draw-name lucky-draw-name--spin' :
            phase === 'winner' ? 'lucky-draw-name lucky-draw-name--land' :
            'lucky-draw-name'
          }
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            color: phase === 'winner' ? c.textBright : c.text,
            letterSpacing: '0.02em',
            lineHeight: 1.15,
            minHeight: '1.25em',
          }}
        >
          {empty ? '—' : display?.display_name ?? '—'}
        </div>

        <button
          type="button"
          onClick={draw}
          disabled={empty || spinning}
          style={{
            marginTop: 32,
            background: empty || spinning ? c.borderMid : c.accent,
            color: empty || spinning ? c.muted : c.bg,
            border: 'none',
            padding: '14px 28px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: empty || spinning ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {spinning ? 'DRAWING…' : winner ? 'DRAW AGAIN' : 'DRAW'}
        </button>
      </div>
    </section>
  );
}
