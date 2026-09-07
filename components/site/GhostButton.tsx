type GhostButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: 'default' | 'accent';
  size?: 'sm' | 'md';
  external?: boolean;
  showArrow?: boolean;
  className?: string;
};

/** Outline CTA with a blueprint sweep + arrow nudge on hover. */
export function GhostButton({
  href,
  children,
  variant = 'default',
  size = 'md',
  external = false,
  showArrow = true,
  className,
}: GhostButtonProps) {
  const classes = [
    'ghost-btn',
    `ghost-btn--${variant}`,
    `ghost-btn--${size}`,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={href}
      className={classes}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="ghost-btn__label">{children}</span>
      {showArrow && (
        <span className="ghost-btn__arrow" aria-hidden>
          →
        </span>
      )}
    </a>
  );
}
