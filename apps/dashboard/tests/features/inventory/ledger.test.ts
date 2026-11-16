import { describe, expect, it } from 'vitest';
import {
  QUANTITY,
  formatQuantity,
  parseQuantity,
  toConsumption,
  toForecastItem,
  toStockMovement,
} from '@/features/inventory/model/ledger';

describe('ledger normalisers', () => {
  it('turns quantities into numbers', () => {
    expect(
      toStockMovement({
        id: 'm',
        type: 'Purchase',
        quantity: '2.5',
        bookingId: null,
        note: null,
        createdBy: null,
        createdAt: '2026-11-16T10:00:00Z',
      }).quantity,
    ).toBe(2.5);

    const c = toConsumption({
      bookingId: 'b',
      vehicleSize: 'Large',
      completedAt: '2026-11-16T10:00:00Z',
      lines: [
        {
          serviceId: 's',
          itemId: 'i',
          itemName: 'Szampon',
          unit: 'L',
          baseQuantity: '0.2',
          estimatedQuantity: '0.26',
          actualQuantity: null,
        },
      ],
    });
    expect(c.lines[0]).toMatchObject({ baseQuantity: 0.2, estimatedQuantity: 0.26, actualQuantity: null });

    const f = toForecastItem({
      itemId: 'i',
      name: 'Szampon',
      unit: 'L',
      stock: '4',
      minStock: null,
      averageDailyUse: '0.5',
      daysLeft: '8',
      plannedUse: '1.5',
      stockAfterPlanned: '2.5',
      runsOutAt: null,
      isLowStock: false,
    });
    expect(f).toMatchObject({ stock: 4, minStock: null, daysLeft: 8, stockAfterPlanned: 2.5 });
  });

  it('reads and formats quantities with Polish decimals, at most three', () => {
    expect(QUANTITY.test('2,5')).toBe(true);
    expect(QUANTITY.test('2,5555')).toBe(false);
    expect(parseQuantity(' 2,5 ')).toBe(2.5);
    expect(formatQuantity(0.125)).toBe('0,125');
    expect(formatQuantity(3)).toBe('3');
  });
});
