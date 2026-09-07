import { forwardRef } from 'react';
import { RocketIcon } from '@/components/site/RocketIcon';

type Direction = 'up' | 'down';

/**
 * Rocket with exhaust aimed opposite the nose.
 * - `down`: travels downward (agenda timeline, scroll rail) — flame points up.
 * - `up`: on the pad (countdown) — flame points down.
 */
export const MissionRocket = forwardRef<
  HTMLDivElement,
  {
    size?: number;
    direction?: Direction;
    wobble?: number;
    className?: string;
  }
>(function MissionRocket({ size = 24, direction = 'down', wobble = 0, className }, ref) {
  const rotation = direction === 'down' ? 180 + wobble : wobble;

  return (
    <div className={`mission-rocket mission-rocket--${direction}${className ? ` ${className}` : ''}`}>
      <span className="mission-rocket__exhaust" aria-hidden />
      <div ref={ref} className="mission-rocket__body" style={{ transform: `rotate(${rotation}deg)` }}>
        <RocketIcon size={size} />
      </div>
    </div>
  );
});
