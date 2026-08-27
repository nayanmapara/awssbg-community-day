import { gridBg } from '@/lib/tokens';

/** The animated blueprint grid behind every page. */
export function GridBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        backgroundImage: gridBg,
        backgroundSize: '56px 56px',
        animation: 'gridDrift 14s linear infinite',
      }}
    />
  );
}
