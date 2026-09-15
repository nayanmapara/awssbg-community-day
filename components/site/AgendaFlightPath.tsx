'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { c } from '@/lib/tokens';
import { SESSION_KIND_ICONS } from '@/lib/sbg-icons';
import { SbgIcon } from '@/components/site/SbgIcon';
import { MissionRocket } from '@/components/site/MissionRocket';
import type { AgendaItem } from '@/lib/types';
import { eventTimeFormatter } from '@/lib/event-time';

type Row = AgendaItem & { startMs: number; endMs: number; timeLabel: string };

/**
 * The rocket tracks whichever session sits at the viewport centre, so it reads
 * as a position indicator rather than a one-shot fill.
 *
 * On event day (now between the first start and last end) it switches to LIVE
 * mode and parks on the session actually happening, ignoring scroll.
 */
export function AgendaFlightPath({ items }: { items: AgendaItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  // Precompute labels and millisecond timestamps once per items change,
  // instead of re-formatting and re-parsing dates on every render.
  const rows = useMemo<Row[]>(
    () => items.map((item) => ({
      ...item,
      startMs: new Date(item.starts_at).getTime(),
      endMs: new Date(item.ends_at).getTime(),
      timeLabel: `${eventTimeFormatter.format(new Date(item.starts_at))} – ${eventTimeFormatter.format(new Date(item.ends_at))}`,
    })),
    [items]
  );

  const liveIndex = useMemo(() => {
    if (now === null || rows.length === 0) return -1;
    const first = rows[0].startMs;
    const last = rows[rows.length - 1].endMs;
    if (now < first || now > last) return -1;
    return rows.findIndex((r) => now >= r.startMs && now <= r.endMs);
  }, [now, rows]);

  const isLive = liveIndex >= 0;
  const n = rows.length;

  // The scroll listener below is attached once on mount; these refs let it
  // read the latest isLive/length without needing to re-subscribe.
  const isLiveRef = useRef(isLive);
  isLiveRef.current = isLive;
  const rowsLenRef = useRef(n);
  rowsLenRef.current = n;

  // Writes the continuous scroll position straight to the DOM instead of
  // through React state, so scrolling doesn't re-render the whole list — and
  // its ~8 inline-styled elements per row — on every animation frame.
  const applyPosition = (pct: number) => {
    const clamped = Math.max(0, Math.min(1, pct));
    if (railFillRef.current) railFillRef.current.style.height = `${clamped * 100}%`;
    if (rocketRef.current) rocketRef.current.style.top = `${clamped * 100}%`;
    if (iconRef.current) {
      iconRef.current.style.transform = `rotate(${180 + Math.sin(clamped * 22) * 9}deg)`;
    }
  };

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);

    setNow(Date.now());
    const clock = setInterval(() => setNow(Date.now()), 30000);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (isLiveRef.current) return; // live mode owns the position instead
        const el = trackRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const focus = window.innerHeight * 0.5;
        const pct = Math.max(0, Math.min(1, (focus - r.top) / Math.max(1, r.height)));
        applyPosition(pct);
        const nextActive = Math.round(pct * Math.max(1, rowsLenRef.current - 1));
        setActiveIndex((prev) => (prev === nextActive ? prev : nextActive));
      });
    };

    // Scroll-driven motion is exactly what prefers-reduced-motion asks us to
    // skip; the rocket just stays parked (LIVE mode below still applies).
    if (!reducedMotion) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    return () => {
      mq.removeEventListener('change', sync);
      if (!reducedMotion) window.removeEventListener('scroll', onScroll);
      clearInterval(clock);
    };
  }, []);

  // LIVE mode is clock-driven, not scroll-driven, so it sets the position
  // here instead of through the scroll handler above.
  useEffect(() => {
    if (!isLive || n === 0) return;
    applyPosition(liveIndex / Math.max(1, n - 1));
    setActiveIndex((prev) => (prev === liveIndex ? prev : liveIndex));
  }, [isLive, liveIndex, n]);

  const railLeft = isMobile ? '11px' : '50%';
  const cols = isMobile ? '0px 22px 1fr' : '1fr 32px 1fr';

  if (n === 0) {
    return (
      <div className="agenda-empty">
        <div className="agenda-empty__dots" aria-hidden>
          <span className="agenda-empty__dot" />
          <span className="agenda-empty__dot" />
          <span className="agenda-empty__dot" />
        </div>
        <p style={{ color: c.faint, fontSize: 13, margin: 0 }}>
          The schedule is being finalised. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <>
      {isLive && (
        <div
          className="agenda-live-badge"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20,
            background: c.card, border: `1px solid ${c.accent}`, padding: '8px 16px',
          }}
        >
          <span style={{ width: 8, height: 8, background: c.accent, animation: 'blink 1.6s step-end infinite' }} />
          <span style={{ fontSize: 12, letterSpacing: '0.06em', color: c.accentHi, fontWeight: 700 }}>
            LIVE NOW — {rows[liveIndex].title}
            {rows[liveIndex].room ? ` · ${rows[liveIndex].room}` : ''}
          </span>
        </div>
      )}

      <div ref={trackRef} style={{ position: 'relative', padding: '20px 0 40px' }}>
        <div style={{ position: 'absolute', left: railLeft, top: 0, bottom: 0, width: 2, background: c.line, transform: 'translateX(-50%)' }} />
        <div
          ref={railFillRef}
          style={{
            position: 'absolute', left: railLeft, top: 0, width: 2,
            background: `linear-gradient(${c.accent},${c.accentHi})`,
            boxShadow: '0 0 16px 2px rgba(77,168,255,0.55)',
            transform: 'translateX(-50%)', height: 0,
            transition: isLive ? 'height .6s ease' : 'height .05s linear',
          }}
        />
        <div
          ref={rocketRef}
          className="agenda-rocket"
          style={{
            position: 'absolute', left: railLeft, top: 0, zIndex: 3,
            transform: 'translate(-50%,-50%)',
            transition: isLive ? 'top .6s ease' : 'top .05s linear',
            filter: 'drop-shadow(0 0 8px rgba(77,168,255,0.7))',
          }}
        >
          <MissionRocket ref={iconRef} size={30} direction="down" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 1 }}>
          {rows.map((item, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            const onLeft = !isMobile && i % 2 === 0;

            const card = (
              <div
                className={`agenda-card${isActive ? ' agenda-card--active' : ''}${isPast ? ' agenda-card--past' : ''}`}
                style={{
                  background: isActive ? c.cardActive : c.card,
                  border: `1px solid ${isActive ? c.accent : c.border}`,
                  padding: '14px 20px', maxWidth: 280,
                  marginRight: onLeft ? 24 : 0,
                  marginLeft: onLeft ? 0 : (isMobile ? 14 : 24),
                  textAlign: onLeft ? 'right' : 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: onLeft ? 'flex-end' : 'flex-start' }}>
                  <SbgIcon
                    {...SESSION_KIND_ICONS[item.kind]}
                    size={14}
                    animate={isActive ? 'glow' : false}
                    style={{ opacity: isActive ? 1 : isPast ? 0.45 : 0.75, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 11, color: isActive ? c.accentHi : c.accent, fontWeight: 700, letterSpacing: '0.05em' }}>
                    {item.timeLabel}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.textBright, marginTop: 4 }}>
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
                  className={`agenda-node${isActive ? ' agenda-node--active' : ''}${isPast ? ' agenda-node--past' : ''}`}
                  style={{
                    justifySelf: 'center',
                    width: 16, height: 16, borderRadius: '50%',
                    background: isPast || isActive ? c.accent : c.borderMid, border: `2px solid ${c.bg}`,
                    transform: isActive ? 'scale(1)' : 'scale(0.75)',
                    transition: 'transform .3s ease, background-color .3s ease, box-shadow .3s ease',
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
