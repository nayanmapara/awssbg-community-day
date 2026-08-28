'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { c } from '@/lib/tokens';

/**
 * CN Tower silhouette — the original design's exact outline (mast, antenna
 * pod, legs, band, SkyPod deck, tapered shaft, tripod base), traced as one
 * continuous filled shape instead of ~20 separate hairline strokes. The
 * hairline version was the original problem: thin 1.4px lines vanish at
 * small sizes or against a glow, which is what read as "incomplete." A
 * filled shape keeps the same recognizable proportions without that
 * fragility. Carries a gradient fill, a soft halo, and a small independent
 * amber "sun".
 *
 * Desktop keeps the corner placement. Below 720px it switches to a much
 * bigger, centred, low-opacity backdrop spanning the whole hero instead of a
 * small corner accent — a corner accent that size doesn't have room to read
 * as a tower on a narrow screen, but a big soft backdrop does.
 */
export function CnTower() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  // Read by the scroll handler below without needing to re-subscribe it
  // every time isMobile changes.
  const isMobileRef = useRef(false);

  const uid = useId();
  const fillId = `cnTowerFill-${uid}`;
  const haloGradId = `cnTowerHalo-${uid}`;
  const sunGradId = `cnTowerSun-${uid}`;
  const blurId = `cnTowerBlur-${uid}`;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const sync = () => { setIsMobile(mq.matches); isMobileRef.current = mq.matches; };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // Parallax offset is written straight to the DOM instead of through state,
  // so scrolling doesn't force a re-render on every frame.
  useEffect(() => {
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        if (!wrapRef.current) return;
        const y = window.scrollY * 0.22;
        wrapRef.current.style.transform = isMobileRef.current
          ? `translateX(-50%) translateY(${y}px)`
          : `translateY(${y}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={isMobile ? {
        position: 'absolute', top: 0, left: '50%', zIndex: -1, pointerEvents: 'none', opacity: 0.28,
        height: 'clamp(320px, 85vw, 460px)', transform: 'translateX(-50%) translateY(0px)',
        maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
      } : {
        position: 'absolute', top: -20, right: '4%', zIndex: -1, pointerEvents: 'none', opacity: 0.5,
        height: 'clamp(240px, 58vw, 760px)', transform: 'translateY(0px)',
        // Fades into whatever comes after the hero instead of hard-cutting.
        maskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
      }}
    >
      <svg height="100%" viewBox="0 0 200 620" fill="none">
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c.accentHi} stopOpacity={0.85} />
            <stop offset="100%" stopColor={c.accentDim} stopOpacity={0.55} />
          </linearGradient>
          <radialGradient id={haloGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c.accent} stopOpacity={0.17} />
            <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
          </radialGradient>
          <radialGradient id={sunGradId} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#f4d9a0" />
            <stop offset="70%" stopColor={c.warn} />
            <stop offset="100%" stopColor={c.warn} stopOpacity={0} />
          </radialGradient>
          <filter id={blurId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* Halo centred on the lower, bolder deck shapes — not the thin hairline legs higher up, which it would otherwise wash out. */}
        <circle cx="100" cy="200" r="90" fill={`url(#${haloGradId})`} filter={`url(#${blurId})`} stroke="none" />

        {/* Small independent sun, positioned to clear the sticky header even at the smallest mobile scale. */}
        <g style={{ animation: 'softFloat 7s ease-in-out infinite' }}>
          <circle cx="136" cy="90" r="17" fill={`url(#${sunGradId})`} filter={`url(#${blurId})`} stroke="none" />
          <circle cx="136" cy="90" r="6" fill={`url(#${sunGradId})`} stroke="none" />
        </g>

        {/*
          One closed outline tracing the original design's exact silhouette:
          mast -> small antenna pod -> legs -> band -> SkyPod deck (the wide
          part) -> taper -> shaft -> tripod base. Filled instead of stroked,
          so it can't lose fine detail the way the hairline version did.
        */}
        <path
          d="M97 6 L97 94
             L87 100 L87 124
             L92 124 L92 172
             L78 172 L78 186
             L66 186 L66 212
             L82 242 L82 500
             L40 610
             L160 610
             L118 500 L118 242
             L134 212 L134 186
             L122 186 L122 172
             L108 172 L108 124
             L113 124 L113 100
             L103 94 L103 6 Z"
          fill={`url(#${fillId})`}
        />
        {/* Deck accent lines sit on top of the solid fill, so unlike a lone hairline they can't disappear on their own. */}
        <path d="M70 199 L130 199" stroke={c.accentHi} strokeOpacity={0.4} strokeWidth={1.5} />
        <path d="M86 300 L114 300" stroke={c.accentHi} strokeOpacity={0.3} strokeWidth={1} />
      </svg>
    </div>
  );
}
