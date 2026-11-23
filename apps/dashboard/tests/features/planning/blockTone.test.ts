import { describe, expect, it } from 'vitest';
import { bookingBlockTone } from '@/features/planning/model/blockTone';

describe('bookingBlockTone', () => {
  it('colours a block by the booking status tone', () => {
    expect(bookingBlockTone('Utworzona')).toBe('before:bg-info-soft border-info');
    expect(bookingBlockTone('Zakończona')).toBe('before:bg-success-soft border-success');
    expect(bookingBlockTone('Anulowana')).toBe('before:bg-danger-soft border-danger');
  });

  it('falls back to neutral for an unknown status', () => {
    expect(bookingBlockTone('Inna')).toBe('before:bg-muted border-border-strong');
    expect(bookingBlockTone(null)).toBe('before:bg-muted border-border-strong');
  });
});
