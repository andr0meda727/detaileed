import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';

const save = vi.fn();
vi.mock('@/features/inventory/api/ledger', () => ({
  useRecipe: () => ({
    isLoading: false,
    data: { serviceId: 's1', lines: [{ itemId: 'i1', itemName: 'Szampon', unit: 'L', quantityForMedium: 0.2 }] },
  }),
  useSaveRecipe: () => ({ mutate: save, isPending: false }),
}));
vi.mock('@/features/inventory/api/inventory', () => ({
  useInventory: () => ({
    isLoading: false,
    data: [
      { id: 'i1', name: 'Szampon', unit: 'L' },
      { id: 'i2', name: 'Wosk', unit: 'ml' },
    ],
  }),
}));

const { RecipeEditor } = await import('@/features/inventory/components/ledger/RecipeEditor');
const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('RecipeEditor', () => {
  it('edits the materials of a service and saves them', () => {
    render(<RecipeEditor serviceId="s1" />, { wrapper });
    expect(screen.getByDisplayValue('0,2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dodaj materiał' }));
    fireEvent.change(screen.getAllByLabelText('Materiał')[1], { target: { value: 'i2' } });
    fireEvent.change(screen.getAllByLabelText('Ilość na średnie auto')[1], { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz materiały' }));

    expect(save).toHaveBeenCalledWith(
      {
        serviceId: 's1',
        body: {
          lines: [
            { itemId: 'i1', quantityForMedium: 0.2 },
            { itemId: 'i2', quantityForMedium: 30 },
          ],
        },
      },
      expect.anything(),
    );
  });

  it('refuses a missing quantity and duplicates', () => {
    save.mockClear();
    render(<RecipeEditor serviceId="s1" />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Dodaj materiał' }));
    fireEvent.change(screen.getAllByLabelText('Materiał')[1], { target: { value: 'i1' } });
    fireEvent.change(screen.getAllByLabelText('Ilość na średnie auto')[1], { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz materiały' }));
    expect(screen.getByRole('alert')).toHaveTextContent('tylko raz');
    expect(save).not.toHaveBeenCalled();
  });
});
