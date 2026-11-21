import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import type { Service } from '@/features/services/model/types';

const create = vi.fn(async () => ({}));
const update = vi.fn(async () => ({}));

// No network: only the mutations are replaced.
vi.mock('@/features/services/api/services', () => ({
  useCreateService: () => ({ mutateAsync: create }),
  useUpdateService: () => ({ mutateAsync: update }),
}));

const { ServiceFormModal } = await import('@/features/services/components/ServiceFormModal');

const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('ServiceFormModal', () => {
  it('creates a service with a category, duration and the filled prices', async () => {
    const onClose = vi.fn();
    render(<ServiceFormModal isOpen service={null} onClose={onClose} />, { wrapper });

    fireEvent.change(screen.getByLabelText('Kategoria'), { target: { value: 'Interior' } });
    fireEvent.change(screen.getByPlaceholderText('np. Korekta lakieru'), { target: { value: 'Pranie tapicerki' } });
    const [small, , large] = screen.getAllByPlaceholderText('na zapytanie');
    fireEvent.change(small, { target: { value: '199' } });
    fireEvent.change(large, { target: { value: '349,50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(create).toHaveBeenCalledWith({
      name: 'Pranie tapicerki',
      category: 'Interior',
      durationMinutes: 60,
      prices: [
        { vehicleSize: 'Small', price: 199 },
        { vehicleSize: 'Large', price: 349.5 },
      ],
    });
  });

  it('edits an existing service and rejects a bad duration', async () => {
    const service: Service = {
      id: 's1',
      name: 'Mycie',
      category: 'ExteriorWash',
      durationMinutes: 45,
      prices: [{ vehicleSize: 'Medium', price: 80 }],
    };
    render(<ServiceFormModal isOpen service={service} onClose={vi.fn()} />, { wrapper });
    expect(screen.getByDisplayValue('80')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('45'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
    expect(await screen.findByText('Od 5 do 720 minut')).toBeInTheDocument();
    expect(update).not.toHaveBeenCalled();
  });
});
