import { gridBg } from '@/lib/tokens';

/** The animated blueprint grid behind every page. */
export function GridBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        // Overhangs the viewport on every side so the translate3d drift below
        // never reveals a seam at the edge.
        position: 'fixed',
        inset: '-56px',
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: gridBg,
        backgroundSize: '56px 56px',
        // transform is compositor-only; the old background-position animation
        // forced a full-viewport repaint on every frame, forever.
        animation: 'gridDrift 14s linear infinite',
        willChange: 'transform',
      }}
    />
  );
}
