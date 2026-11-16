/**
 * Dates and times in a studio's time zone. The API sends and takes UTC moments (ISO with `Z`) and plain days
 * (`yyyy-MM-dd`, the studio's local days); screens show the studio's local time whatever the browser's zone is.
 * Built on Intl only. See the backend's api-conventions.md, "Dates and times".
 */

export const DEFAULT_TIME_ZONE = 'Europe/Warsaw';

type Moment = Date | string;

const toDate = (m: Moment) => (typeof m === 'string' ? new Date(m) : m);
const pad = (n: number) => String(n).padStart(2, '0');

const partsFormatters = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(timeZone: string) {
  let f = partsFormatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    partsFormatters.set(timeZone, f);
  }
  return f;
}

/** The wall-clock fields of a moment in a zone. */
export function zonedParts(moment: Moment, timeZone: string) {
  const parts: Record<string, number> = {};
  for (const p of partsFormatter(timeZone).formatToParts(toDate(moment))) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

/** The studio day (`yyyy-MM-dd`) a moment falls on. */
export function dayInZone(moment: Moment, timeZone: string): string {
  const p = zonedParts(moment, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** The studio's wall-clock time of a moment, `HH:mm`. */
export function timeInZone(moment: Moment, timeZone: string): string {
  const p = zonedParts(moment, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** Today in the studio's zone. */
export function todayInZone(timeZone: string, now: Date = new Date()): string {
  return dayInZone(now, timeZone);
}

/** How far the zone is ahead of UTC at a moment, in milliseconds. */
function offsetMs(moment: Date, timeZone: string): number {
  const p = zonedParts(moment, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(moment.getTime() / 1000) * 1000;
}

/**
 * The UTC moment of a local day and time in the zone, as the API expects it (ISO with `Z`). A time skipped by a
 * spring-forward change resolves to the moment just after the gap; a repeated autumn hour to its first occurrence.
 */
export function zonedToUtc(day: string, time: string, timeZone: string): string {
  const [y, mo, d] = day.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  // Two passes: the offset at the first guess may differ from the offset at the answer around a DST change.
  let guess = wall - offsetMs(new Date(wall), timeZone);
  guess = wall - offsetMs(new Date(guess), timeZone);
  return new Date(guess).toISOString();
}

/** UTC bounds of a studio day: from its first moment (included) to the next day's first moment (excluded). */
export function dayBoundsUtc(day: string, timeZone: string): { start: string; end: string } {
  return { start: zonedToUtc(day, '00:00', timeZone), end: zonedToUtc(addDays(day, 1), '00:00', timeZone) };
}

/** A calendar day `n` days after (or before) `day`; plain calendar arithmetic, no zone involved. */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + n));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Day of the week of a calendar day, Monday = 0 … Sunday = 6. */
export function weekdayIndex(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

const displayFormatters = new Map<string, Intl.DateTimeFormat>();

/** Formats a moment in the zone in Polish, e.g. `{ day: 'numeric', month: 'long' }` → "16 listopada". */
export function formatInZone(moment: Moment, timeZone: string, options: Intl.DateTimeFormatOptions): string {
  const key = `${timeZone}|${JSON.stringify(options)}`;
  let f = displayFormatters.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat('pl-PL', { ...options, timeZone });
    displayFormatters.set(key, f);
  }
  return f.format(toDate(moment));
}

/** Formats a calendar day (`yyyy-MM-dd`) in Polish without any zone shift. */
export function formatDay(day: string, options: Intl.DateTimeFormatOptions): string {
  const [y, m, d] = day.split('-').map(Number);
  return formatInZone(new Date(Date.UTC(y, m - 1, d, 12)), 'UTC', options);
}
