import { describe, expect, it } from 'vitest';
import type { Booking } from '@/features/bookings';
import { revenueSeries } from '@/features/dashboard-home/model/revenue';

const WAW = 'Europe/Warsaw';
const booking = (scheduledAt: string, totalPrice: number) => ({ id: scheduledAt, scheduledAt, totalPrice }) as Booking;

describe('revenueSeries', () => {
  // Monday 16 Nov 2026.
  const today = '2026-11-16';

  it('sums the last seven studio days, today last, named by weekday', () => {
    const { weekly } = revenueSeries(
      [
        booking('2026-11-16T09:00:00Z', 100),
        booking('2026-11-16T12:00:00Z', 50.5),
        // 00:30 on Monday in Warsaw, still Sunday in UTC.
        booking('2026-11-15T23:30:00Z', 20),
        booking('2026-11-14T09:00:00Z', 70),
      ],
      WAW,
      today,
    );
    expect(weekly).toHaveLength(7);
    expect(weekly.at(-1)).toEqual({ name: 'Pon', rev: 170.5, orders: 3 });
    expect(weekly.at(-3)).toEqual({ name: 'Sob', rev: 70, orders: 1 });
    expect(weekly[0].name).toBe('Wt');
  });

  it('groups four weeks ending today and leaves future bookings out', () => {
    const { monthly } = revenueSeries(
      [
        booking('2026-11-16T09:00:00Z', 10), // today: this week
        booking('2026-11-10T09:00:00Z', 20), // 6 days ago: this week
        booking('2026-11-09T09:00:00Z', 30), // 7 days ago: last week
        booking('2026-10-20T09:00:00Z', 40), // 27 days ago: four weeks back
        booking('2026-11-20T09:00:00Z', 999), // future
      ],
      WAW,
      today,
    );
    expect(monthly.map((p) => [p.name, p.rev])).toEqual([
      ['Tydz 1', 40],
      ['Tydz 2', 0],
      ['Tydz 3', 30],
      ['Tydz 4', 30],
    ]);
  });
});
