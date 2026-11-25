import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';

const base = { unit: 'L', minStock: null, averageDailyUse: 0.5, plannedUse: 1, isLowStock: false };
vi.mock('@/features/inventory/api/ledger', () => ({
  useForecast: () => ({
    isLoading: false,
    data: [
      {
        ...base,
        itemId: 'a',
        name: 'Wosk',
        stock: 10,
        daysLeft: 20,
        stockAfterPlanned: 9,
        runsOutAt: '2026-12-07T08:00:00Z',
      },
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

const { ForecastView } = await import('@/features/inventory/components/ledger/ForecastView');

describe('ForecastView', () => {
  it('lists items soonest to run out first, with when they run out in the studio zone', () => {
    render(<ForecastView />);
    const rows = screen.getAllByRole('row').slice(1, 4);
    expect(rows.map((r) => within(r).getAllByRole('cell')[0].textContent)).toEqual([
      'Szampon Niski stan',
      'Wosk ',
      'Nieużywany ',
    ]);
    // Running out before the planned bookings are done is flagged; a later date is plain text.
    expect(within(rows[0]).getByText('17.11.2026, 09:00').querySelector('[data-slot=dot]')).not.toBeNull();
    expect(within(rows[1]).getByText('7.12.2026, 09:00').querySelector('[data-slot=dot]')).toBeNull();
    expect(screen.getByText('×1,12')).toBeInTheDocument();
    expect(screen.getByText('8%')).toBeInTheDocument();
  });

  it('labels the values for the stacked cards on phones', () => {
    render(<ForecastView />);
    const first = within(screen.getAllByRole('row')[1]).getAllByRole('cell');
    expect(first.map((cell) => cell.dataset.label)).toEqual([
      undefined,
      'Stan',
      'Zużycie / dzień',
      'Wystarczy na',
      'Zaplanowane (14 dni)',
      'Po zaplanowanych',
      'Zabraknie',
    ]);
    expect(screen.getByText('8%').closest('td')).toHaveAttribute('data-label', 'Średni błąd');
  });
});
