import Link from 'next/link';
import { c } from '@/lib/tokens';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 }}>404</div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 800, margin: '14px 0 16px' }}>
          Lost in the cloud
        </h1>
        <p style={{ color: c.muted, fontSize: 14, marginBottom: 28 }}>
          That page does not exist.
        </p>
        <Link href="/" style={{ background: c.accent, color: c.bg, padding: '14px 28px', fontWeight: 700, letterSpacing: '0.05em', fontSize: 13 }}>
          BACK TO THE EVENT
        </Link>
      </div>
    </main>
  );
}
