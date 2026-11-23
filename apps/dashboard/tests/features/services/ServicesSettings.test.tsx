import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Service } from '@/features/services/model/types';

const remove = vi.fn(async () => ({}));
const services: Service[] = [
  {
    id: 's1',
    name: 'Mycie',
    category: 'ExteriorWash',
    durationMinutes: 45,
    prices: [{ vehicleSize: 'Medium', price: 80 }],
  },
];

// No network: the list and the delete mutation are replaced; the form isn't opened here.
vi.mock('@/features/services/api/services', () => ({
  useServices: () => ({ data: services, isLoading: false }),
  useDeleteService: () => ({ mutateAsync: remove, isPending: false }),
}));
vi.mock('@/features/services/components/ServiceFormModal', () => ({ ServiceFormModal: () => null }));

const { ServicesSettings } = await import('@/features/services/components/ServicesSettings');

describe('ServicesSettings', () => {
  it('asks before deleting a service', async () => {
    const addToast = vi.fn();
    render(<ServicesSettings addToast={addToast} />);

    fireEvent.click(screen.getByRole('button', { name: 'Usuń Mycie' }));
    expect(remove).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog', { name: 'Usunąć usługę?' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Usuń' }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith('s1'));
    expect(addToast).toHaveBeenCalledWith('Usługa usunięta', 'success');
  });
});
