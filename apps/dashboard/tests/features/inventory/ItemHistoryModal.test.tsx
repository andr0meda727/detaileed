import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import type { InventoryItem } from '@/features/inventory/model/types';

const add = vi.fn();
vi.mock('@/features/inventory/api/ledger', () => ({
  useAddMovement: () => ({ mutate: add, isPending: false }),
  useMovements: () => ({
    isLoading: false,
    data: {
      totalPages: 1,
      items: [
        {
          id: 'm2',
          type: 'Consumption',
          quantity: -0.26,
          bookingId: 'b',
          note: null,
          createdBy: null,
          createdAt: '2026-11-16T10:00:00Z',
        },
        {
          id: 'm1',
          type: 'Purchase',
          quantity: 5,
          bookingId: null,
          note: 'Faktura 12/11',
          createdBy: null,
          createdAt: '2026-11-10T10:00:00Z',
        },
      ],
    },
  }),
}));

const { ItemHistoryModal } = await import('@/features/inventory/components/ledger/ItemHistoryModal');

const item: InventoryItem = {
  id: 'i1',
  studioId: 's1',
  name: 'Szampon',
  description: null,
  categoryName: null,
  unit: 'L',
  stock: 4.74,
  minStock: 1,
};
const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('ItemHistoryModal', () => {
  it('shows the history and records a delivery or a stocktake', () => {
    // Like the real mutation, success clears the form.
    add.mockImplementation((_body, opts) => opts.onSuccess());
    render(<ItemHistoryModal item={item} onClose={vi.fn()} />, { wrapper });
    expect(screen.getByText('Zużycie (wizyta)')).toBeInTheDocument();
    expect(screen.getByText('-0,26 L')).toBeInTheDocument();
    expect(screen.getByText('+5 L')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Ile przyszło/), { target: { value: '2,5' } });
    fireEvent.change(screen.getByLabelText('Notatka (opcjonalnie)'), { target: { value: 'Faktura 13/11' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
    expect(add).toHaveBeenCalledWith(
      { itemId: 'i1', kind: 'Purchase', quantity: 2.5, note: 'Faktura 13/11' },
      expect.anything(),
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Inwentaryzacja' }));
    fireEvent.change(screen.getByLabelText(/Ile jest naprawdę/), { target: { value: '4' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
    expect(add).toHaveBeenLastCalledWith(
      { itemId: 'i1', kind: 'Stocktake', quantity: 4, note: null },
      expect.anything(),
    );
  });

  it('refuses a bad quantity', () => {
    add.mockReset();
    render(<ItemHistoryModal item={item} onClose={vi.fn()} />, { wrapper });
    fireEvent.change(screen.getByLabelText(/Ile przyszło/), { target: { value: '1,2345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
    expect(screen.getByText(/Podaj ilość/)).toBeInTheDocument();
    expect(add).not.toHaveBeenCalled();
  });
});
