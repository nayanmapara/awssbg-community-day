'use client';
import { useEffect, useRef } from 'react';
import { MissionRocket } from '@/components/site/MissionRocket';

/** Page scroll progress — one functional rocket, large screens only. */
export function ScrollProgressRail() {
  const fillRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const pct = Math.max(0, Math.min(1, window.scrollY / max));
        if (fillRef.current) fillRef.current.style.height = `${pct * 100}%`;
        if (rocketRef.current) rocketRef.current.style.top = `${pct * 100}%`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="scroll-progress-rail" aria-hidden>
      <div className="scroll-progress-rail__track">
        <div ref={fillRef} className="scroll-progress-rail__fill" />
        <div ref={rocketRef} className="scroll-progress-rail__rocket">
          <MissionRocket size={18} direction="down" />
        </div>
      </div>
    </div>
  );
}
