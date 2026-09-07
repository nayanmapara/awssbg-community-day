import type { ReactNode } from 'react';

/** Blueprint corner brackets for map panels and key blocks. */
export function BlueprintFrame({
  children,
  className,
  style,
  pulse,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  pulse?: boolean;
}) {
  const classes = ['blueprint-frame', pulse ? 'blueprint-frame--pulse' : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
