import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES } from '@/features/bookings/model/statuses';

/**
 * Bookings the schedule shows: open ones always, completed ones from the current week (from Monday),
 * cancelled ones from today only.
 */
export function visibleBookings(bookings: Booking[], now = new Date()): Booking[] {
  const todayStr = now.toISOString().split('T')[0];
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  return bookings.filter((b) => {
    if (b.status === BOOKING_STATUSES.ZAKONCZONA.name) return new Date(b.completedAt || b.scheduledAt) >= weekStart;
    if (b.status === BOOKING_STATUSES.ANULOWANA.name) return (b.completedAt || b.scheduledAt).startsWith(todayStr);
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

/** Bookings grouped by day (`YYYY-MM-DD` of `scheduledAt`), days ascending. */
export function groupBookingsByDay(bookings: Booking[]): { date: string; bookings: Booking[] }[] {
  const groups = new Map<string, Booking[]>();
  for (const b of bookings) {
    const date = b.scheduledAt.split('T')[0];
    groups.set(date, [...(groups.get(date) ?? []), b]);
  }
  return [...groups].map(([date, items]) => ({ date, bookings: items })).sort((a, b) => a.date.localeCompare(b.date));
}

/** Cells of a Monday-first month grid: null for padding before the 1st, then the day numbers. */
export function monthGrid(month: Date): (number | null)[] {
  const y = month.getFullYear();
  const m = month.getMonth();
  const total = new Date(y, m + 1, 0).getDate();
  const start = (new Date(y, m, 1).getDay() + 6) % 7;
  return [...Array<null>(start).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
}

export const byScheduledAt = (a: Booking, b: Booking) => a.scheduledAt.localeCompare(b.scheduledAt);
