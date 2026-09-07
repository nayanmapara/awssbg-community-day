import { c } from '@/lib/tokens';
import { GridBackdrop } from '@/components/site/GridBackdrop';
import { GhostButton } from '@/components/site/GhostButton';

export default function NotFound() {
  return (
    <>
      <GridBackdrop />
      <main style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center', overflow: 'hidden' }}>
        <div aria-hidden className="not-found-code" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          404
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-fade hero-fade-1" style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 }}>ROUTE NOT FOUND</div>
          <h1 className="hero-fade hero-fade-2" style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800, margin: '14px 0 16px' }}>
            Lost in the cloud
          </h1>
          <p className="hero-fade hero-fade-3" style={{ color: c.muted, fontSize: 14, marginBottom: 28 }}>
            That page does not exist, but Community Day still does.
          </p>
          <div className="hero-fade hero-fade-4">
            <GhostButton href="/">BACK TO THE EVENT</GhostButton>
          </div>
        </div>
      </main>
    </>
  );
}
