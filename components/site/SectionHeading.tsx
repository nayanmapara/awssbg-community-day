import { c } from '@/lib/tokens';

const kickerStyle = { fontSize: 12, letterSpacing: '0.08em', color: c.accent, fontWeight: 700 } as const;

/** Shared section title block. Mission variant adjusts kicker styling only — no decorative icons. */
export function SectionHeading({
  kicker,
  title,
  align = 'left',
  mission = false,
  titleStyle,
}: {
  kicker: string;
  title: React.ReactNode;
  align?: 'left' | 'center';
  mission?: boolean;
  titleStyle?: React.CSSProperties;
}) {
  return (
    <>
      <span
        className={`kicker-line${mission ? ' kicker-line--mission' : ''}`}
        style={{ ...kickerStyle, display: 'inline-block' }}
      >
        {kicker}
      </span>
      <h2
        style={{
          fontSize: 'clamp(28px,4vw,40px)',
          fontWeight: 800,
          margin: '14px 0 0',
          textAlign: align === 'center' ? 'center' : undefined,
          ...titleStyle,
        }}
      >
        {title}
      </h2>
    </>
  );
}
