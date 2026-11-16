import { describe, expect, it } from 'vitest';
import { formatPln } from '../src/money';

describe('formatPln', () => {
  it('formats złoty with a comma and two decimals', () => {
    expect(formatPln(1234.5)).toBe('1234,50');
    expect(formatPln(null)).toBe('0,00');
  });
});
