'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { c } from '@/lib/tokens';

/** Extra headroom above the spire tip for the sun glow + blur (viewBox units). */
const VIEW_TOP_PAD = 28;

/**
 * Path traced from public/cn-tower-icon.svg — the canonical CN Tower silhouette.
 * Keep in sync if the source SVG is updated.
 */
const CN_TOWER_PATH =
  'M14.52 139.41h6.86V367.9H0c8.66-75.12 12.8-151.63 14.52-228.49zm-3.88-30.85v3.99l-5.69 5.21v.01h36.06v-.01l-5.69-5.21v-3.99h-8.21l-.18-5.35h.75c.25 0 .46-.2.46-.46v-4.54c0-.25-.21-.46-.46-.46h-.93l-.94-28.77h.6c1.5 0 2.73-1.23 2.73-2.74 0-1.5-1.23-2.73-2.73-2.73h-.54l-.11-27.34h-.68V21.94h-.68L24.07 0h-2.59l-.33 21.94h-.69v14.23h-.67l-.11 27.34h-.54a2.74 2.74 0 0 0-2.73 2.73c0 1.5 1.22 2.73 2.72 2.74l-.51 28.77h-.75c-.26 0-.46.21-.46.46v4.54c0 .26.21.46.46.46h.66l-.1 5.35h-7.79zm13.57 19.8v2.76h1.43l.5-2.76h-1.93zm-1.59 2.76v-2.76h-2.34l.5 2.76h1.84zm5.15-2.76-.5 2.76h2.67l.5-2.76h-2.67zm4.29 0-.5 2.76h2.67l.5-2.76h-2.67zm-12.91 2.76-.5-2.76h-2.67l.5 2.76h2.67zm-4.29 0-.5-2.76h-2.68l.51 2.76h2.67zm-9.91-10.59v2.32h36.06v-2.32H4.95zm0 3.12v3.11h36.06v-3.11H4.95zm1.33 4.71 2.3 2.76h1.98l-.5-2.76H6.28zm-.54 4.34c-1.15 2.07-.25 5.42 2.84 5.32h28.8c3.09.1 3.98-3.24 2.85-5.31H5.86c-.04 0-.08 0-.12-.01zm31.64-1.58 2.3-2.76h-3.32l-.5 2.76h1.52zm-12.8 8.29h6.34c2.03 76.89 6.66 153.34 15.04 228.49H24.58V139.41z';

/**
 * CN Tower hero graphic — silhouette from `/cn-tower-icon.svg`, tinted with an
 * accent gradient, a soft halo behind the SkyPod, and a small amber "sun".
 *
 * Desktop keeps the corner placement. Below 720px it switches to a much bigger,
 * centred, low-opacity backdrop spanning the whole hero.
 */
export function CnTower() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
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
        position: 'absolute', top: -16, left: '50%', zIndex: -1, pointerEvents: 'none', opacity: 0.28,
        height: 'clamp(320px, 85vw, 460px)', transform: 'translateX(-50%) translateY(0px)',
        overflow: 'visible',
        maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
      } : {
        position: 'absolute', top: -20, right: '4%', zIndex: -1, pointerEvents: 'none', opacity: 0.5,
        height: 'clamp(240px, 58vw, 760px)', transform: 'translateY(0px)',
        overflow: 'visible',
        maskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
      }}
    >
      <svg
        height="100%"
        viewBox={`-6 -${VIEW_TOP_PAD} 57.96 ${367.9 + VIEW_TOP_PAD + 6}`}
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', overflow: 'visible' }}
      >
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

        {/* Halo centred on the SkyPod deck (~y 125 in the icon viewBox). */}
        <circle cx="23" cy="125" r="38" fill={`url(#${haloGradId})`} filter={`url(#${blurId})`} />

        {/* Small independent sun near the spire tip. */}
        <g style={{ animation: 'softFloat 7s ease-in-out infinite' }}>
          <circle cx="34" cy="18" r="8" fill={`url(#${sunGradId})`} filter={`url(#${blurId})`} />
          <circle cx="34" cy="18" r="3" fill={`url(#${sunGradId})`} />
        </g>

        <path
          d={CN_TOWER_PATH}
          fill={`url(#${fillId})`}
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
}
