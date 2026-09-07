import type { SessionKind } from '@/lib/types';

/** AWS Student Builder Group icon names from public/Logos-Fonts/Icons/SVG/. */
export type SbgIconName =
  | 'Bolt'
  | 'Calendar'
  | 'Clock'
  | 'Drop'
  | 'Key'
  | 'Ladder'
  | 'Speaker'
  | 'Teams'
  | 'Trophy'
  | 'Wrench'
  | 'Single Bracket Smile'
  | 'Double Bracket Smile';

export type SbgIconColor =
  | 'Blue'
  | 'Amber'
  | 'Mint'
  | 'Magenta'
  | 'Purple'
  | 'White'
  | 'Grey 850';

const ICON_DIR = '/Logos-Fonts/Icons/SVG';

export function sbgIconSrc(name: SbgIconName, color: SbgIconColor = 'Blue'): string {
  const file = `AWS Student Builder Group_RGB_Icons_${name}_${color}.svg`;
  return `${ICON_DIR}/${encodeURIComponent(file)}`;
}

/** Hero quick-info strip icons. */
export const QUICK_INFO_ICONS: Record<string, { name: SbgIconName; color: SbgIconColor }> = {
  DATE: { name: 'Calendar', color: 'Blue' },
  TIME: { name: 'Clock', color: 'Mint' },
  LOCATION: { name: 'Drop', color: 'Blue' },
  COST: { name: 'Key', color: 'Amber' },
};

/** Rotating palette for highlight cards. */
export const HIGHLIGHT_ICON_PALETTE: { name: SbgIconName; color: SbgIconColor }[] = [
  { name: 'Speaker', color: 'Blue' },
  { name: 'Wrench', color: 'Mint' },
  { name: 'Teams', color: 'Purple' },
  { name: 'Trophy', color: 'Amber' },
  { name: 'Bolt', color: 'Magenta' },
  { name: 'Ladder', color: 'Blue' },
];

/** Best-guess icon from a stats label. */
export function statIcon(label: string, index: number): { name: SbgIconName; color: SbgIconColor } {
  const l = label.toUpperCase();
  if (l.includes('WORKSHOP')) return { name: 'Wrench', color: 'Mint' };
  if (l.includes('MEMBER')) return { name: 'Teams', color: 'Blue' };
  if (l.includes('EVENT')) return { name: 'Double Bracket Smile', color: 'Purple' };
  if (l.includes('SERVICE') || l.includes('AWS')) return { name: 'Bolt', color: 'Amber' };
  return HIGHLIGHT_ICON_PALETTE[index % HIGHLIGHT_ICON_PALETTE.length];
}

export const SESSION_KIND_ICONS: Record<SessionKind, { name: SbgIconName; color: SbgIconColor }> = {
  keynote: { name: 'Speaker', color: 'Blue' },
  talk: { name: 'Speaker', color: 'Mint' },
  workshop: { name: 'Wrench', color: 'Mint' },
  jam: { name: 'Bolt', color: 'Amber' },
  break: { name: 'Clock', color: 'Grey 850' },
  networking: { name: 'Teams', color: 'Purple' },
  admin: { name: 'Key', color: 'Blue' },
};
