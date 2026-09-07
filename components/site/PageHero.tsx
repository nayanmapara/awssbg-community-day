import Link from 'next/link';
import { c, maxW, pad } from '@/lib/tokens';

const kickerStyle = { fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 } as const;

/** Sub-page hero with staggered entrance. */
export function PageHero({
  kicker,
  title,
  children,
  backHref,
  backLabel,
}: {
  kicker?: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  let step = 0;
  const fade = () => `hero-fade hero-fade-${++step}`;

  return (
    <section style={{ position: 'relative', zIndex: 1, maxWidth: maxW, margin: '0 auto', padding: `88px ${pad} 24px` }}>
      {backHref && (
        <Link
          href={backHref}
          className={fade()}
          style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', display: 'inline-block', marginBottom: 18 }}
        >
          {backLabel ?? '← BACK'}
        </Link>
      )}
      {kicker && (
        <span className={`kicker-line ${fade()}`} style={{ ...kickerStyle, display: 'inline-block' }}>
          {kicker}
        </span>
      )}
      <h1 className={fade()} style={{ fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, margin: '14px 0 20px' }}>
        {title}
      </h1>
      {children && (
        <div className={fade()} style={{ maxWidth: 640, color: '#a7b1c6', fontSize: 16, lineHeight: 1.6 }}>
          {children}
        </div>
      )}
    </section>
  );
}
