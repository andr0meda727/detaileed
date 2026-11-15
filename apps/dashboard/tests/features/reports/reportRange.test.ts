import { describe, expect, it } from 'vitest';
import { reportRangeError } from '@/features/reports/model/reportRange';

describe('reportRangeError', () => {
  it('accepts a range up to a year, both days included', () => {
    expect(reportRangeError('2026-01-01', '2026-01-31')).toBeNull();
    expect(reportRangeError('2026-01-01', '2026-01-01')).toBeNull();
    expect(reportRangeError('2024-01-01', '2024-12-31')).toBeNull();
  });

  it('rejects missing dates, reversed ranges and ranges over a year', () => {
    expect(reportRangeError('', '2026-01-31')).toBe('Wybierz zakres dat');
    expect(reportRangeError('2026-02-01', '2026-01-31')).toBe('Data od nie może być późniejsza niż data do');
    expect(reportRangeError('2025-01-01', '2026-01-02')).toBe('Raport może obejmować najwyżej rok');
  });
});
