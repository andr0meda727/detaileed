import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES } from '@/features/bookings/model/statuses';
import { addDays, dayInZone, todayInZone, weekdayIndex, zonedToUtc } from '@detaileed/domain/studioTime';

/**
 * Bookings the schedule shows: open ones always, completed ones from the current week (from Monday),
 * cancelled ones from today only. Days and weeks are the studio's (`timeZone`).
 */
export function visibleBookings(bookings: Booking[], timeZone: string, now = new Date()): Booking[] {
  const today = todayInZone(timeZone, now);
  const weekStart = new Date(zonedToUtc(addDays(today, -weekdayIndex(today)), '00:00', timeZone));

  return bookings.filter((b) => {
    if (b.status === BOOKING_STATUSES.ZAKONCZONA.name) return new Date(b.completedAt || b.scheduledAt) >= weekStart;
    if (b.status === BOOKING_STATUSES.ANULOWANA.name)
      return dayInZone(b.completedAt || b.scheduledAt, timeZone) === today;
    return true;
  });
}

/** Case-insensitive match on services, client name, brand, model and licence plate. */
export function matchesBookingQuery(b: Booking, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    b.services.join(' '),
    b.client.name,
    b.vehicle.brand ?? '',
    b.vehicle.model ?? '',
    b.vehicle.licensePlate,
  ].some((field) => field.toLowerCase().includes(q));
}

/** Bookings grouped by the studio day (`YYYY-MM-DD`) of `scheduledAt`, days ascending. */
export function groupBookingsByDay(bookings: Booking[], timeZone: string): { date: string; bookings: Booking[] }[] {
  const groups = new Map<string, Booking[]>();
  for (const b of bookings) {
    const date = dayInZone(b.scheduledAt, timeZone);
    groups.set(date, [...(groups.get(date) ?? []), b]);
  }
  return [...groups].map(([date, items]) => ({ date, bookings: items })).sort((a, b) => a.date.localeCompare(b.date));
}

/** Cells of a Monday-first month grid (`month` = `YYYY-MM`): null for padding before the 1st, then the day numbers. */
export function monthGrid(month: string): (number | null)[] {
  const [y, m] = month.split('-').map(Number);
  const total = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const start = weekdayIndex(`${month}-01`);
  return [...Array<null>(start).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
}

export const byScheduledAt = (a: Booking, b: Booking) => a.scheduledAt.localeCompare(b.scheduledAt);
