'use client';
import { useRef, type CSSProperties } from 'react';

/** Mouse-following 3D tilt. Falls back to a plain card for touch/keyboard users. */
export function TiltCard({
  children, style, strength = 16,
}: {
  children: React.ReactNode;
  style?: CSSProperties;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transition = 'transform .05s linear';
    el.style.transform =
      `perspective(800px) rotateX(${(0.5 - py) * strength}deg) rotateY(${(px - 0.5) * strength}deg) scale(1.02)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform .4s ease';
    el.style.transform = 'none';
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ willChange: 'transform', ...style }}>
      {children}
    </div>
  );
}
