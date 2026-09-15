/** Wall-clock timezone for the event venue (Toronto). */
export const EVENT_TIME_ZONE = 'America/Toronto';

const LOCALE = 'en-CA';

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: EVENT_TIME_ZONE,
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const timeFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: EVENT_TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit',
});

const shortDateFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: EVENT_TIME_ZONE,
  month: 'long',
  day: 'numeric',
});

const adminFmt = new Intl.DateTimeFormat(LOCALE, {
  timeZone: EVENT_TIME_ZONE,
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const zonedPartsFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: EVENT_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function parseIso(iso: string): Date {
  return new Date(iso);
}

export function formatEventDate(iso: string): string {
  return dateFmt.format(parseIso(iso));
}

export function formatEventTime(iso: string): string {
  return timeFmt.format(parseIso(iso));
}

export function formatEventTimeRange(startsAt: string, endsAt: string): string {
  return `${formatEventTime(startsAt)} – ${formatEventTime(endsAt)}`;
}

export function formatEventShortDate(iso: string): string {
  return shortDateFmt.format(parseIso(iso));
}

export function formatEventDateTime(iso: string): string {
  return adminFmt.format(parseIso(iso));
}

function zonedWallParts(date: Date) {
  const parts = zonedPartsFmt.formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return {
    year: Number(pick('year')),
    month: Number(pick('month')),
    day: Number(pick('day')),
    hour: Number(pick('hour')),
    minute: Number(pick('minute')),
  };
}

/** ISO instant → value for `<input type="datetime-local">` in event local time. */
export function toDatetimeLocalInput(iso: string | null): string {
  if (!iso) return '';
  const p = zonedWallParts(parseIso(iso));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/** `<input type="datetime-local">` value (event wall time) → ISO UTC for storage. */
export function fromDatetimeLocalInput(local: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) return new Date(local).toISOString();

  const want = {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5]),
  };

  // Iteratively find the UTC instant whose Toronto wall clock matches `want`.
  let t = Date.UTC(want.year, want.month - 1, want.day, want.hour, want.minute);
  for (let i = 0; i < 6; i++) {
    const got = zonedWallParts(new Date(t));
    if (
      got.year === want.year &&
      got.month === want.month &&
      got.day === want.day &&
      got.hour === want.hour &&
      got.minute === want.minute
    ) {
      return new Date(t).toISOString();
    }
    const deltaMin =
      (want.year - got.year) * 525_600 +
      (want.month - got.month) * 43_200 +
      (want.day - got.day) * 1_440 +
      (want.hour - got.hour) * 60 +
      (want.minute - got.minute);
    t += deltaMin * 60_000;
  }
  return new Date(t).toISOString();
}

/** Shared formatter for agenda session times (client + SSR). */
export const eventTimeFormatter = timeFmt;
