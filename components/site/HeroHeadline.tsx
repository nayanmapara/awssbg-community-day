'use client';

/** Hero headline with a blueprint-style line reveal. */
export function HeroHeadline({ line1, line2 }: { line1: string; line2: string }) {
  return (
    <h1
      className="hero-headline"
      style={{ fontSize: 'clamp(42px,7vw,86px)', lineHeight: 1.02, margin: '0 0 24px', fontWeight: 800, letterSpacing: '-0.01em' }}
    >
      <span className="hero-headline__line">
        <span className="hero-headline__inner">{line1}</span>
      </span>
      <span className="hero-headline__line hero-headline__line--2">
        <span className="hero-headline__inner">{line2}</span>
      </span>
    </h1>
  );
}
