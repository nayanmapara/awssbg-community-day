import { c } from '@/lib/tokens';

/** Blueprint rocket glyph — body only; exhaust is rendered by MissionRocket. */
export function RocketIcon({
  size = 24,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
    >
      <polygon points="12,1 16,9 8,9" fill={c.accentHi} />
      <rect x="8" y="9" width="8" height="9" fill={c.accent} />
      <polygon points="8,14 3,20 8,18" fill={c.accentDim} />
      <polygon points="16,14 21,20 16,18" fill={c.accentDim} />
      <circle cx="12" cy="13" r="1.6" fill={c.bg} />
    </svg>
  );
}
