type RegisterButtonProps = {
  href: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
};

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Accent CTA with a white panel that slides left on hover (21.dev-style). */
export function RegisterButton({
  href,
  children,
  size = 'md',
  fullWidth,
  onClick,
  className,
}: RegisterButtonProps) {
  const classes = [
    'register-btn',
    `register-btn--${size}`,
    fullWidth ? 'register-btn--full' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={classes}
    >
      <span className="register-btn__label">{children}</span>
      <span className="register-btn__slide" aria-hidden>
        <span className="register-btn__arrow">
          <ChevronRight />
        </span>
      </span>
    </a>
  );
}
