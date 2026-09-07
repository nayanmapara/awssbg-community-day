'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { c } from '@/lib/tokens';

function parseStat(value: string) {
  const match = value.trim().match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return null;
  return { prefix: match[1], target: parseFloat(match[2]), suffix: match[3] };
}

/** Counts up numeric stats when scrolled into view. Non-numeric values render as-is. */
export function StatCounter({ value, style }: { value: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const parsed = parseStat(value);
  const [display, setDisplay] = useState(parsed ? `${parsed.prefix}0${parsed.suffix}` : value);
  const ran = useRef(false);

  useEffect(() => {
    if (!parsed || !ref.current) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(value);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || ran.current) return;
        ran.current = true;
        io.disconnect();

        const start = performance.now();
        const duration = 1200;
        const { prefix, target, suffix } = parsed;

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - t) ** 3;
          const current = Math.round(target * eased);
          setDisplay(`${prefix}${current}${suffix}`);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [parsed, value]);

  return (
    <div
      ref={ref}
      className="stat-counter"
      style={{ fontSize: 36, fontWeight: 800, color: c.accent, ...style }}
    >
      {display}
    </div>
  );
}
