import type { Booking } from '@/features/bookings';
import { addDays, dayInZone, weekdayIndex } from '@detaileed/domain/studioTime';

export interface RevenuePoint {
  name: string;
  rev: number;
  orders: number;
}

const WEEKDAYS = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'];

const round = (n: number) => Math.round(n * 100) / 100;

/** Whole days from `from` to `to` (calendar days, `yyyy-MM-dd`). */
function daysBetween(from: string, to: string): number {
  const utc = (d: string) => {
    const [y, m, day] = d.split('-').map(Number);
    return Date.UTC(y, m - 1, day);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

/**
 * Revenue and booking count per studio day for the last 7 days (today last), and per week for the last 4 weeks
 * (the current week last; weeks end today). Bookings after today are left out.
 */
export function revenueSeries(
  bookings: Booking[],
  timeZone: string,
  today: string,
): { weekly: RevenuePoint[]; monthly: RevenuePoint[] } {
  const ago = bookings
    .map((b) => ({ b, daysAgo: daysBetween(dayInZone(b.scheduledAt, timeZone), today) }))
    .filter(({ daysAgo }) => daysAgo >= 0);

  const sum = (from: number, to: number) => {
    const inRange = ago.filter(({ daysAgo }) => daysAgo >= from && daysAgo <= to).map(({ b }) => b);
    return { rev: round(inRange.reduce((s, b) => s + b.totalPrice, 0)), orders: inRange.length };
  };

  const weekly = [6, 5, 4, 3, 2, 1, 0].map((i) => ({
    name: WEEKDAYS[weekdayIndex(addDays(today, -i))],
    ...sum(i, i),
  }));
  const monthly = [3, 2, 1, 0].map((i) => ({ name: `Tydz ${4 - i}`, ...sum(i * 7, i * 7 + 6) }));
  return { weekly, monthly };
}
