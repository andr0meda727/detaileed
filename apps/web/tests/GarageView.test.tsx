import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ApiError } from '@detaileed/api-client';
import { ToastProvider } from '@detaileed/ui';

const add = vi.fn();
const update = vi.fn();
const remove = vi.fn();
vi.mock('@/features/account/api/me', () => ({
  useGarage: () => ({
    isLoading: false,
    data: [{ id: 'car1', licensePlate: 'KR 12345', brand: 'Volvo', model: 'XC90', size: 'Large' }],
  }),
  useAddVehicle: () => ({ mutate: add, isPending: false }),
  useUpdateVehicle: () => ({ mutate: update, isPending: false }),
  useDeleteVehicle: () => ({ mutate: remove, isPending: false }),
}));

const { default: GarageView } = await import('@/features/account/components/GarageView');
const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('GarageView', () => {
  it('lists cars and adds one, showing the API error for a duplicate plate', async () => {
    add.mockImplementation((_body, opts) => opts.onError(new ApiError(409, { code: 'CUSTOMER_VEHICLE_EXISTS' })));
    render(<GarageView />, { wrapper });
    expect(screen.getByText('Volvo XC90')).toBeInTheDocument();
    expect(screen.getByText('Moje auta (1/10)')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dodaj auto' }));
    fireEvent.change(screen.getByLabelText('Nr rejestracyjny'), { target: { value: 'kr 12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));

    await waitFor(() =>
      expect(add).toHaveBeenCalledWith(
        { licensePlate: 'KR 12345', brand: null, model: null, size: 'Medium' },
        expect.anything(),
      ),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Auto z tym numerem rejestracyjnym jest już w garażu.');
  });

  it('edits and deletes a car', async () => {
    render(<GarageView />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Edytuj KR 12345' }));
    expect(screen.getByDisplayValue('XC90')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz' }));
    await waitFor(() =>
      expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: 'car1' }), expect.anything()),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Anuluj' }));
    fireEvent.click(screen.getByRole('button', { name: 'Usuń KR 12345' }));
    expect(remove).toHaveBeenCalledWith('car1', expect.anything());
  });
});
