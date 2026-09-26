'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { c } from '@/lib/tokens';

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

export function LuckyDrawConsole({ entrants }: { entrants: LuckyDrawEntrant[] }) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [display, setDisplay] = useState<LuckyDrawEntrant | null>(null);
  const [winner, setWinner] = useState<LuckyDrawEntrant | null>(null);
  const [history, setHistory] = useState<LuckyDrawEntrant[]>([]);
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
      setHistory((h) => [chosen, ...h].slice(0, 8));
      return;
    }

    const totalMs = 4200;
    const start = performance.now();
    let nextTick = 40;

    const tick = () => {
      const elapsed = performance.now() - start;
      if (elapsed >= totalMs) {
        setDisplay(chosen);
        setWinner(chosen);
        setPhase('winner');
        setHistory((h) => [chosen, ...h].slice(0, 8));
        return;
      }

      const progress = elapsed / totalMs;
      const show = progress > 0.82 ? chosen : pickRandom(entrants);
      setDisplay(show);

      nextTick = Math.min(220, 40 + progress * progress * 280);
      const id = window.setTimeout(tick, nextTick);
      timers.current.push(id);
    };

    tick();
  };

  const empty = entrants.length === 0;

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', color: c.accent, fontWeight: 700, marginBottom: 8 }}>
          LIVE
        </div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: c.textBright }}>Lucky Draw</h1>
        <p style={{ margin: '10px 0 0', color: c.muted, fontSize: 13, lineHeight: 1.6, maxWidth: 520 }}>
          Pulls a random name from the builder roster ({entrants.length} entrant{entrants.length === 1 ? '' : 's'}).
        </p>
      </div>

      <div
        className={phase === 'winner' ? 'lucky-draw-stage lucky-draw-stage--win' : 'lucky-draw-stage'}
        style={{
          position: 'relative',
          background: c.card,
          border: `1px solid ${phase === 'winner' ? c.accent : c.border}`,
          padding: '48px 28px',
          textAlign: 'center',
          overflow: 'hidden',
          minHeight: 220,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {phase === 'winner' && <div className="lucky-draw-burst" aria-hidden />}

        <div style={{ fontSize: 10, letterSpacing: '0.1em', color: c.faint, fontWeight: 700 }}>
          {phase === 'spinning' ? 'DRAWING…' : phase === 'winner' ? 'WINNER' : 'READY'}
        </div>

        <div
          key={display?.id ?? 'empty'}
          className={spinning ? 'lucky-draw-name lucky-draw-name--spin' : phase === 'winner' ? 'lucky-draw-name lucky-draw-name--land' : 'lucky-draw-name'}
          style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            color: phase === 'winner' ? c.textBright : c.text,
            letterSpacing: '0.02em',
            lineHeight: 1.15,
            minHeight: '1.2em',
          }}
        >
          {empty ? 'No entrants yet' : display?.display_name ?? '—'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={draw}
          disabled={empty || spinning}
          style={{
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
          {spinning ? 'SPINNING…' : winner ? 'DRAW AGAIN' : 'DRAW WINNER'}
        </button>
      </div>

      {history.length > 0 && (
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.08em', color: c.faintest, fontWeight: 700, marginBottom: 12 }}>
            RECENT DRAWS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((h, i) => (
              <div
                key={`${h.id}-${i}`}
                style={{
                  padding: '10px 14px',
                  background: c.panel,
                  border: `1px solid ${c.line}`,
                  fontWeight: 700,
                  color: c.textBright,
                }}
              >
                {h.display_name}
              </div>
            ))}
          </div>
        </div>
      )}

      {empty && (
        <p style={{ marginTop: 24, color: c.warnText, fontSize: 13, lineHeight: 1.5 }}>
          Nobody is in the builder roster yet. Ask people to submit at /builder-profile first.
        </p>
      )}
    </div>
  );
}
