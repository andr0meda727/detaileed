import { describe, expect, it } from 'vitest';
import type { Booking } from '@/features/bookings/model/types';
import { BOOKING_STATUSES } from '@/features/bookings/model/statuses';
import { groupBookingsByDay, matchesBookingQuery, monthGrid, visibleBookings } from '@/features/bookings/model/filters';

const booking = (over: Partial<Booking>): Booking =>
  ({
    id: Math.random().toString(),
    scheduledAt: '2026-11-10T09:00:00Z',
    completedAt: null,
    status: BOOKING_STATUSES.UTWORZONA.name,
    services: ['Mycie'],
    client: { id: 'c', name: 'Jan Kowalski', email: null, phone: null },
    vehicle: { id: 'v', licensePlate: 'WX 12345', brand: 'Audi', model: 'A4', size: 'Medium' },
    ...over,
  }) as Booking;

describe('booking filters', () => {
  // Thursday
  const now = new Date('2026-11-12T12:00:00Z');

  it('shows open bookings, this week’s completed and today’s cancelled', () => {
    const open = booking({ scheduledAt: '2026-01-01T09:00:00Z' });
    const doneThisWeek = booking({ status: BOOKING_STATUSES.ZAKONCZONA.name, completedAt: '2026-11-10T10:00:00Z' });
    const doneLastWeek = booking({ status: BOOKING_STATUSES.ZAKONCZONA.name, completedAt: '2026-11-06T10:00:00Z' });
    const cancelledToday = booking({ status: BOOKING_STATUSES.ANULOWANA.name, completedAt: '2026-11-12T08:00:00Z' });
    const cancelledYesterday = booking({
      status: BOOKING_STATUSES.ANULOWANA.name,
      completedAt: '2026-11-11T08:00:00Z',
    });

    expect(visibleBookings([open, doneThisWeek, doneLastWeek, cancelledToday, cancelledYesterday], now)).toEqual([
      open,
      doneThisWeek,
      cancelledToday,
    ]);
  });

  it('matches plate, client and services case-insensitively', () => {
    const b = booking({});
    expect(matchesBookingQuery(b, 'wx 123')).toBe(true);
    expect(matchesBookingQuery(b, 'kowal')).toBe(true);
    expect(matchesBookingQuery(b, 'mycie')).toBe(true);
    expect(matchesBookingQuery(b, 'bmw')).toBe(false);
    expect(matchesBookingQuery(b, '  ')).toBe(true);
  });

  it('groups by day in order', () => {
    const groups = groupBookingsByDay([
      booking({ scheduledAt: '2026-11-11T09:00:00Z' }),
      booking({ scheduledAt: '2026-11-10T09:00:00Z' }),
      booking({ scheduledAt: '2026-11-11T15:00:00Z' }),
    ]);
    expect(groups.map((g) => [g.date, g.bookings.length])).toEqual([
      ['2026-11-10', 1],
      ['2026-11-11', 2],
    ]);
  });

  it('pads the month grid to start on Monday', () => {
    // November 2026 starts on a Sunday: six empty cells, then 30 days.
    const grid = monthGrid(new Date(2026, 10, 15));
    expect(grid.slice(0, 7)).toEqual([null, null, null, null, null, null, 1]);
    expect(grid.filter((d) => d !== null)).toHaveLength(30);
  });
});
