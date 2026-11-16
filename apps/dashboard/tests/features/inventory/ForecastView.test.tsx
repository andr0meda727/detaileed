import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

const base = { unit: 'L', minStock: null, averageDailyUse: 0.5, plannedUse: 1, isLowStock: false };
vi.mock('@/features/inventory/api/ledger', () => ({
  useForecast: () => ({
    isLoading: false,
    data: [
      { ...base, itemId: 'a', name: 'Wosk', stock: 10, daysLeft: 20, stockAfterPlanned: 9, runsOutAt: null },
      {
        ...base,
        itemId: 'b',
        name: 'Nieużywany',
        stock: 3,
        daysLeft: null,
        averageDailyUse: 0,
        stockAfterPlanned: 3,
        runsOutAt: null,
      },
      {
        ...base,
        itemId: 'c',
        name: 'Szampon',
        stock: 0.5,
        daysLeft: 1,
        stockAfterPlanned: -0.5,
        runsOutAt: '2026-11-17T08:00:00Z',
        isLowStock: true,
      },
    ],
  }),
  useAccuracy: () => ({
    isLoading: false,
    data: [
      {
        serviceId: 's',
        itemId: 'c',
        itemName: 'Szampon',
        factor: 1.12,
        factorApplied: true,
        samples: 5,
        meanAbsolutePercentageError: 8.4,
      },
    ],
  }),
}));

const { default: ForecastView } = await import('@/features/inventory/components/ForecastView');

describe('ForecastView', () => {
  it('lists items soonest to run out first, with when they run out in the studio zone', () => {
    render(<ForecastView />);
    const rows = screen.getAllByRole('row').slice(1, 4);
    expect(rows.map((r) => within(r).getAllByRole('cell')[0].textContent)).toEqual([
      'Szampon Niski stan',
      'Wosk ',
      'Nieużywany ',
    ]);
    expect(within(rows[0]).getByText('17.11.2026, 09:00')).toBeInTheDocument();
    expect(screen.getByText('×1,12')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
  });
});
