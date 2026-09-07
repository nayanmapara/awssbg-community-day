// Design tokens lifted verbatim from the approved HTML prototypes.
export const c = {
  bg: '#0a0f1c',
  bgAlt: '#0b1120',
  panel: '#0d1424',
  card: '#121a2c',
  cardActive: '#16243c',
  line: '#1b2438',
  lineSoft: '#141c30',
  border: '#22314f',
  borderMid: '#1f2b45',
  borderStrong: '#2b3a58',
  accent: '#4da8ff',
  accentHi: '#7cc3ff',
  accentDim: '#2f8fef',
  text: '#e7ebf3',
  textBright: '#f4f7fb',
  muted: '#8b96ab',
  mutedDim: '#6b7690',
  faint: '#4a5773',
  faintest: '#3d4a68',
  warn: '#e6b85c',
  warnBg: '#2a2013',
  warnBorder: '#5a4620',
  warnText: '#d9c9a3',
  danger: '#d98a8a',
} as const;

export const font = "'Amazon Ember Display', 'Amazon Ember'";
export const fontMono = "'Amazon Ember Mono', 'Amazon Ember Display', 'Amazon Ember'";

export const gridBg =
  'linear-gradient(rgba(77,168,255,0.07) 1px,transparent 1px),' +
  'linear-gradient(90deg,rgba(77,168,255,0.07) 1px,transparent 1px)';

export const pad = 'clamp(16px,4vw,32px)';
export const maxW = 1280;
