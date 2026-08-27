'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { c } from '@/lib/tokens';
import type { AgendaItem } from '@/lib/types';

const fmt = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });

const range = (a: string, b: string) => `${fmt(a)} – ${fmt(b)}`;

/**
 * The rocket tracks whichever session sits at the viewport centre, so it reads
 * as a position indicator rather than a one-shot fill.
 *
 * On event day (now between the first start and last end) it switches to LIVE
 * mode and parks on the session actually happening, ignoring scroll.
 */
export function AgendaFlightPath({ items }: { items: AgendaItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);

    setNow(Date.now());
    const clock = setInterval(() => setNow(Date.now()), 30000);

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const el = trackRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const focus = window.innerHeight * 0.5;
        setProgress(Math.max(0, Math.min(1, (focus - r.top) / Math.max(1, r.height))));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      mq.removeEventListener('change', sync);
      window.removeEventListener('scroll', onScroll);
      clearInterval(clock);
    };
  }, []);

  const liveIndex = useMemo(() => {
    if (now === null || items.length === 0) return -1;
    const first = new Date(items[0].starts_at).getTime();
    const last = new Date(items[items.length - 1].ends_at).getTime();
    if (now < first || now > last) return -1;
    return items.findIndex(
      (it) => now >= new Date(it.starts_at).getTime() && now <= new Date(it.ends_at).getTime()
    );
  }, [now, items]);

  const isLive = liveIndex >= 0;
  const n = items.length;
  const p = isLive ? liveIndex / Math.max(1, n - 1) : progress;
  const activeIndex = isLive ? liveIndex : Math.round(p * (n - 1));

  const railLeft = isMobile ? '11px' : '50%';
  const cols = isMobile ? '0px 22px 1fr' : '1fr 32px 1fr';
  const rocketAngle = 180 + Math.sin(p * 22) * 9;

  if (n === 0) {
    return (
      <p style={{ color: c.faint, fontSize: 13 }}>
        The schedule is being finalised. Check back soon.
      </p>
    );
  }

  return (
    <>
      {isLive && (
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20,
            background: c.card, border: `1px solid ${c.accent}`, padding: '8px 16px',
          }}
        >
          <span style={{ width: 8, height: 8, background: c.accent, animation: 'blink 1.6s step-end infinite' }} />
          <span style={{ fontSize: 12, letterSpacing: '0.06em', color: c.accentHi, fontWeight: 700 }}>
            LIVE NOW — {items[liveIndex].title}
            {items[liveIndex].room ? ` · ${items[liveIndex].room}` : ''}
          </span>
        </div>
      )}

      <div ref={trackRef} style={{ position: 'relative', padding: '20px 0 40px' }}>
        <div style={{ position: 'absolute', left: railLeft, top: 0, bottom: 0, width: 2, background: c.line, transform: 'translateX(-50%)' }} />
        <div
          style={{
            position: 'absolute', left: railLeft, top: 0, width: 2,
            background: `linear-gradient(${c.accent},${c.accentHi})`,
            boxShadow: '0 0 16px 2px rgba(77,168,255,0.55)',
            transform: 'translateX(-50%)', height: `${p * 100}%`,
            transition: isLive ? 'height .6s ease' : 'height .05s linear',
          }}
        />
        <div
          style={{
            position: 'absolute', left: railLeft, top: `${p * 100}%`, zIndex: 3,
            transform: `translate(-50%,-50%) rotate(${rocketAngle}deg)`,
            transition: isLive ? 'top .6s ease' : 'top .05s linear',
            filter: 'drop-shadow(0 0 8px rgba(77,168,255,0.7))',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden>
            <polygon points="12,1 16,9 8,9" fill={c.accentHi} />
            <rect x="8" y="9" width="8" height="9" fill={c.accent} />
            <polygon points="8,14 3,20 8,18" fill={c.accentDim} />
            <polygon points="16,14 21,20 16,18" fill={c.accentDim} />
            <circle cx="12" cy="13" r="1.6" fill={c.bg} />
            <polygon points="9,18 15,18 12,23" fill={c.warn} />
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
          {items.map((item, i) => {
            const passed = i / Math.max(1, n - 1) <= p + 0.001;
            const isActive = i === activeIndex;
            const onLeft = !isMobile && i % 2 === 0;

            const card = (
              <div
                style={{
                  background: isActive ? c.cardActive : c.card,
                  border: `1px solid ${isActive ? c.accent : c.border}`,
                  boxShadow: isActive ? '0 0 0 1px rgba(77,168,255,0.35), 0 8px 26px rgba(0,0,0,0.45)' : 'none',
                  padding: '14px 20px', maxWidth: 280,
                  marginRight: onLeft ? 24 : 0,
                  marginLeft: onLeft ? 0 : (isMobile ? 14 : 24),
                  textAlign: onLeft ? 'right' : 'left',
                  transition: 'background .3s ease, border-color .3s ease, box-shadow .3s ease',
                }}
              >
                <div style={{ fontSize: 11, color: isActive ? c.accentHi : c.accent, fontWeight: 700, letterSpacing: '0.05em' }}>
                  {range(item.starts_at, item.ends_at)}
                </div>
                <div
                  style={{
                    fontSize: 14, fontWeight: 700, color: c.textBright, marginTop: 4,
                    opacity: passed ? 1 : 0.55, transition: 'opacity .3s ease',
                  }}
                >
                  {item.title}
                </div>
                {item.attribution && (
                  <div style={{ fontSize: 10, color: c.mutedDim, letterSpacing: '0.05em', marginTop: 6, fontWeight: 600 }}>
                    {item.attribution}
                  </div>
                )}
              </div>
            );

            return (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', minHeight: 64 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{onLeft ? card : null}</div>
                <div
                  style={{
                    justifySelf: 'center',
                    width: isActive ? 16 : 12, height: isActive ? 16 : 12, borderRadius: '50%',
                    background: passed ? c.accent : c.borderMid, border: `2px solid ${c.bg}`,
                    boxShadow: isActive
                      ? '0 0 14px 4px rgba(77,168,255,0.85)'
                      : passed ? '0 0 8px 1px rgba(77,168,255,0.45)' : 'none',
                    transition: 'all .3s ease',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>{onLeft ? null : card}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
