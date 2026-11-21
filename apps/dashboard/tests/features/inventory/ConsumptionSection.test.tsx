import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';

const state = vi.hoisted(() => ({ recorded: true }));
const correct = vi.fn();
vi.mock('@/features/inventory/api/ledger', () => ({
  useConsumption: () => ({
    isLoading: false,
    data: state.recorded
      ? {
          bookingId: 'b1',
          vehicleSize: 'Large',
          completedAt: '2026-11-16T12:00:00Z',
          lines: [
            {
              serviceId: 's1',
              itemId: 'i1',
              itemName: 'Szampon',
              unit: 'L',
              baseQuantity: 0.26,
              estimatedQuantity: 0.28,
              actualQuantity: null,
            },
          ],
        }
      : null,
  }),
  useCorrectConsumption: () => ({ mutate: correct, isPending: false }),
}));

const { ConsumptionSection } = await import('@/features/inventory/components/ledger/ConsumptionSection');
const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('ConsumptionSection', () => {
  it('shows the norm and estimate and records what the visit really used', () => {
    render(<ConsumptionSection bookingId="b1" />, { wrapper });
    expect(screen.getByText('0,26 L')).toBeInTheDocument();
    expect(screen.getByText('0,28 L')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Faktyczne zużycie: Szampon'), { target: { value: '0,3' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz zużycie' }));
    expect(correct).toHaveBeenCalledWith(
      { bookingId: 'b1', lines: [{ serviceId: 's1', itemId: 'i1', actualQuantity: 0.3 }] },
      expect.anything(),
    );
  });

  it('explains when nothing was recorded yet', () => {
    state.recorded = false;
    render(<ConsumptionSection bookingId="b1" />, { wrapper });
    expect(screen.getByText(/liczy się chwilę po zakończeniu/)).toBeInTheDocument();
    state.recorded = true;
  });
});
