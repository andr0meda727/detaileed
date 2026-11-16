import { describe, expect, it } from 'vitest';
import {
  addDays,
  dayBoundsUtc,
  dayInZone,
  formatDay,
  formatInZone,
  timeInZone,
  todayInZone,
  weekdayIndex,
  zonedToUtc,
} from '../src/studioTime';

const WAW = 'Europe/Warsaw';

describe('dayInZone / timeInZone', () => {
  it('uses the studio day, not the UTC one, just after local midnight', () => {
    // 23:30 UTC on 15 Nov is 00:30 on 16 Nov in Warsaw (UTC+1).
    expect(dayInZone('2026-11-15T23:30:00Z', WAW)).toBe('2026-11-16');
    expect(timeInZone('2026-11-15T23:30:00Z', WAW)).toBe('00:30');
  });

  it('follows summer time', () => {
    // UTC+2 in July.
    expect(timeInZone('2026-07-01T06:00:00Z', WAW)).toBe('08:00');
  });

  it('works for other zones', () => {
    expect(timeInZone('2026-11-16T08:00:00Z', 'America/New_York')).toBe('03:00');
  });

  it('gives today in the zone', () => {
    expect(todayInZone(WAW, new Date('2026-12-31T23:15:00Z'))).toBe('2027-01-01');
  });
});

describe('zonedToUtc', () => {
  it('turns a winter local time into UTC', () => {
    expect(zonedToUtc('2026-11-16', '08:00', WAW)).toBe('2026-11-16T07:00:00.000Z');
  });

  it('turns a summer local time into UTC', () => {
    expect(zonedToUtc('2026-07-01', '08:00', WAW)).toBe('2026-07-01T06:00:00.000Z');
  });

  it('handles the days of the clock changes', () => {
    // 29 Mar 2026: 02:00 → 03:00. 10:00 local is already summer time.
    expect(zonedToUtc('2026-03-29', '10:00', WAW)).toBe('2026-03-29T08:00:00.000Z');
    // 25 Oct 2026: 03:00 → 02:00. 10:00 local is winter time again.
    expect(zonedToUtc('2026-10-25', '10:00', WAW)).toBe('2026-10-25T09:00:00.000Z');
  });

  it('round-trips through dayInZone and timeInZone', () => {
    const utc = zonedToUtc('2026-11-16', '17:45', WAW);
    expect(dayInZone(utc, WAW)).toBe('2026-11-16');
    expect(timeInZone(utc, WAW)).toBe('17:45');
  });
});

describe('dayBoundsUtc', () => {
  it('spans the studio day, 23 hours on the spring change', () => {
    expect(dayBoundsUtc('2026-03-29', WAW)).toEqual({
      start: '2026-03-28T23:00:00.000Z',
      end: '2026-03-29T22:00:00.000Z',
    });
  });
});

describe('calendar helpers', () => {
  it('adds days across months and years', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('numbers weekdays from Monday', () => {
    expect(weekdayIndex('2026-11-16')).toBe(0); // Monday
    expect(weekdayIndex('2026-11-22')).toBe(6); // Sunday
  });
});

describe('formatting', () => {
  it('formats a moment in the zone in Polish', () => {
    expect(formatInZone('2026-11-15T23:30:00Z', WAW, { day: 'numeric', month: 'long' })).toBe('16 listopada');
  });

  it('formats a calendar day without shifting it', () => {
    expect(formatDay('2026-11-16', { day: 'numeric', month: 'long' })).toBe('16 listopada');
  });
});
