export function ChipLogo({ size = 30 }: { size?: number }) {
  const f = '#4da8ff';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="6" y="6" width="3" height="12" fill={f} />
      <rect x="15" y="6" width="3" height="12" fill={f} />
      <rect x="6" y="6" width="12" height="3" fill={f} />
      <rect x="6" y="15" width="12" height="3" fill={f} />
      <rect x="9" y="1" width="2" height="4" fill={f} />
      <rect x="13" y="1" width="2" height="4" fill={f} />
      <rect x="9" y="19" width="2" height="4" fill={f} />
      <rect x="13" y="19" width="2" height="4" fill={f} />
      <rect x="1" y="9" width="4" height="2" fill={f} />
      <rect x="1" y="13" width="4" height="2" fill={f} />
      <rect x="19" y="9" width="4" height="2" fill={f} />
      <rect x="19" y="13" width="4" height="2" fill={f} />
    </svg>
  );
}
