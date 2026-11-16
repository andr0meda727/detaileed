import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import type { InventoryItem } from '@/features/inventory/model/types';

const categories = vi.hoisted(() => ({ data: [{ id: 'cat1', name: 'Chemia' }] as unknown, isPending: false }));
const createItem = vi.fn(async () => ({}));
const updateItem = vi.fn(async () => ({}));

// No network: the modal only needs the categories and the save mutations.
vi.mock('@/features/inventory/api/categories', () => ({
  useCategories: () => categories,
  useCreateCategory: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock('@/features/inventory/api/inventory', () => ({
  useCreateInventoryItem: () => ({ mutateAsync: createItem }),
  useUpdateInventoryItem: () => ({ mutateAsync: updateItem }),
}));

const { default: InventoryItemModal } = await import('@/features/inventory/components/InventoryItemModal');

const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;
const item: InventoryItem = {
  id: 'i1',
  studioId: 's1',
  name: 'Szampon',
  description: null,
  categoryName: 'Chemia',
  unit: 'L',
  stock: 2.5,
  minStock: 1,
};

describe('InventoryItemModal', () => {
  it('shows validation errors and does not save an empty item', async () => {
    render(<InventoryItemModal isOpen item={null} onClose={vi.fn()} />, { wrapper });
    fireEvent.click(screen.getByText('Zapisz'));

    expect(await screen.findByText('Nazwa produktu jest wymagana')).toBeInTheDocument();
    expect(createItem).not.toHaveBeenCalled();
  });

  it('saves an edit with decimal stock and keeps the category', async () => {
    const onClose = vi.fn();
    render(<InventoryItemModal isOpen item={item} onClose={onClose} />, { wrapper });
    expect(screen.getAllByText('Chemia')[0].tagName).toBe('SPAN'); // the picked label, not a dropdown option

    fireEvent.change(screen.getByDisplayValue('2,5'), { target: { value: '3,75' } });
    fireEvent.click(screen.getByText('Zapisz'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(updateItem).toHaveBeenCalledWith({
      id: 'i1',
      dto: { name: 'Szampon', description: null, categoryId: 'cat1', unit: 'L', stock: 3.75, minStock: 1 },
    });
  });

  it('waits for the categories before showing an edit', () => {
    categories.isPending = true;
    render(<InventoryItemModal isOpen item={item} onClose={vi.fn()} />, { wrapper });
    expect(screen.queryByText('Zapisz')).not.toBeInTheDocument();
    categories.isPending = false;
  });
});
