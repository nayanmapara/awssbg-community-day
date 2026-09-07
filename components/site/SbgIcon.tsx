import type { CSSProperties } from 'react';
import { sbgIconSrc, type SbgIconColor, type SbgIconName } from '@/lib/sbg-icons';

type SbgIconProps = {
  name: SbgIconName;
  color?: SbgIconColor;
  size?: number;
  /** Subtle float or glow — respects prefers-reduced-motion via CSS. */
  animate?: 'float' | 'glow' | false;
  style?: CSSProperties;
  className?: string;
};

export function SbgIcon({
  name,
  color = 'Blue',
  size = 24,
  animate = false,
  style,
  className,
}: SbgIconProps) {
  const animClass = animate === 'float' ? 'sbg-icon-float' : animate === 'glow' ? 'sbg-icon-glow' : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local static SVG assets
    <img
      src={sbgIconSrc(name, color)}
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={[animClass, className].filter(Boolean).join(' ') || undefined}
      style={{ display: 'block', flexShrink: 0, ...style }}
    />
  );
}

/** Icon inside a soft blueprint panel — used in hero info, stats, highlights. */
export function SbgIconBadge({
  name,
  color = 'Blue',
  size = 28,
  animate = 'glow',
}: {
  name: SbgIconName;
  color?: SbgIconColor;
  size?: number;
  animate?: 'float' | 'glow' | false;
}) {
  return (
    <div
      className="sbg-icon-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 20,
        height: size + 20,
        background: 'rgba(77,168,255,0.06)',
        border: '1px solid rgba(77,168,255,0.14)',
      }}
    >
      <SbgIcon name={name} color={color} size={size} animate={animate} />
    </div>
  );
}
