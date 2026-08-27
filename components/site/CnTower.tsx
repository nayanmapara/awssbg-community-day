'use client';
import { useEffect, useState } from 'react';

/** Line-art CN Tower. Hidden below 720px, parallaxes slower than the content. */
export function CnTower() {
  const [y, setY] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)');
    const sync = () => setShow(!mq.matches);
    sync();
    mq.addEventListener('change', sync);

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; setY(window.scrollY); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { mq.removeEventListener('change', sync); window.removeEventListener('scroll', onScroll); };
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute', top: -40, right: '4%', height: 760,
        zIndex: 0, pointerEvents: 'none', opacity: 0.5,
        transform: `translateY(${y * 0.22}px)`,
      }}
    >
      <svg height="100%" viewBox="0 0 200 620" fill="none" stroke="#4da8ff" strokeWidth={1.4} strokeLinecap="square">
        <path d="M100 6 L100 94" />
        <path d="M95 40 L105 40" opacity={0.5} />
        <path d="M94 68 L106 68" opacity={0.5} />
        <path d="M87 100 L113 100 L111 124 L89 124 Z" />
        <path d="M87 110 L113 110" opacity={0.6} />
        <path d="M92 124 L92 172" opacity={0.8} />
        <path d="M108 124 L108 172" opacity={0.8} />
        <path d="M78 172 L122 172 L122 186 L78 186 Z" />
        <path d="M66 186 L134 186 L134 212 L66 212 Z" />
        <path d="M66 199 L134 199" opacity={0.5} />
        <path d="M66 212 L134 212 L118 242 L82 242 Z" />
        <path d="M86 242 L82 500" />
        <path d="M114 242 L118 500" />
        <path d="M95 242 L95 500" opacity={0.35} />
        <path d="M105 242 L105 500" opacity={0.35} />
        <path d="M84 320 L116 320" opacity={0.3} />
        <path d="M83 410 L117 410" opacity={0.3} />
        <path d="M82 500 L40 610" />
        <path d="M118 500 L160 610" />
        <path d="M95 500 L95 610" opacity={0.5} />
        <path d="M105 500 L105 610" opacity={0.5} />
        <path d="M40 610 L160 610" />
      </svg>
    </div>
  );
}
