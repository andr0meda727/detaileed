import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const remove = vi.fn(async () => undefined);
const mutation = { mutateAsync: vi.fn(), isPending: false };
vi.mock('@/features/inventory/api/categories', () => ({
  useCategories: () => ({ isLoading: false, data: [{ id: 'c1', name: 'Chemia' }] }),
  useCreateCategory: () => mutation,
  useUpdateCategory: () => mutation,
  useDeleteCategory: () => ({ mutateAsync: remove, isPending: false }),
}));

const { CategoriesSettings } = await import('@/features/inventory/components/settings/CategoriesSettings');

describe('CategoriesSettings', () => {
  it('asks before deleting a category', async () => {
    const addToast = vi.fn();
    render(<CategoriesSettings addToast={addToast} />);

    fireEvent.click(screen.getByRole('button', { name: 'Usuń kategorię: Chemia' }));
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog', { name: 'Usunąć kategorię?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Usuń' }));
    await waitFor(() => expect(addToast).toHaveBeenCalledWith('Kategoria usunięta', 'success'));
    expect(remove).toHaveBeenCalledWith('c1');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
});
