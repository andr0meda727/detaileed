import { describe, expect, it } from 'vitest';
import { dayMonthOf, fullDateOf, longDateOf, shortMonthOf, timeOf } from '@/features/for-studios/model/demoFormat';

describe('demo date text', () => {
  it('reads wall-clock parts from the string, with no time zone', () => {
    expect(timeOf('2026-04-15T09:00')).toBe('09:00');
    expect(dayMonthOf('2026-04-15T09:00')).toBe('15.04');
    expect(shortMonthOf('2026-04-15T09:00')).toBe('kwi');
  });

  it('names the weekday and month of a day', () => {
    expect(longDateOf('2026-04-15')).toBe('środa, 15 kwietnia');
  });

  it('writes the greeting date with a capital letter and the year', () => {
    expect(fullDateOf('2026-04-15')).toBe('Środa, 15 kwietnia 2026');
  });
});
