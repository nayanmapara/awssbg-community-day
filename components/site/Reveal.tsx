'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

/**
 * Scroll reveal with a hard safety net: if the observer never fires (unusual
 * viewports, embedded frames), a timer force-shows the content at 2.5s so it
 * can never be stranded invisible.
 */
export function Reveal({
  children, from = 'translateY(28px) scale(0.98)', delay = 0, style,
}: {
  children: React.ReactNode;
  from?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }),
      { threshold: 0, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    const fallback = setTimeout(() => setShown(true), 2500);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, []);

  return (
    <div
      ref={ref}
      className={shown ? 'is-revealed' : undefined}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : from,
        transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
