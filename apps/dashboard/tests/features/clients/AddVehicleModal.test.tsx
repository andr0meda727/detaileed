import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import type { Client } from '@/features/clients/model/types';

const client: Client = { id: 'c1', name: 'Jan Kowalski', email: null, phone: '500600700', nip: null, vehicles: [] };
const createVehicle = vi.fn(async () => ({}));

// The modal only needs the client list and the create mutations; no network.
vi.mock('@/features/clients/api/clients', () => ({
  useClients: () => ({ data: [client] }),
  useCreateClient: () => ({ mutateAsync: vi.fn() }),
  useCreateVehicle: () => ({ mutateAsync: createVehicle }),
}));

const { AddVehicleModal } = await import('@/features/clients/components/AddVehicleModal');

const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('AddVehicleModal', () => {
  it('asks for an owner before saving the vehicle', async () => {
    render(<AddVehicleModal isOpen onClose={vi.fn()} />, { wrapper });
    fireEvent.change(screen.getByPlaceholderText('Nr Rejestracyjny *'), { target: { value: 'WX1234A' } });
    fireEvent.click(screen.getByText('Zapisz Pojazd'));

    expect(await screen.findByText('Wybierz istniejącego klienta lub dodaj nowego.')).toBeInTheDocument();
    expect(createVehicle).not.toHaveBeenCalled();
  });

  it('adds the vehicle with its size to the picked client and closes', async () => {
    const onClose = vi.fn();
    render(<AddVehicleModal isOpen onClose={onClose} />, { wrapper });
    fireEvent.change(screen.getByPlaceholderText('Szukaj klienta po nazwie lub kontakcie...'), {
      target: { value: 'jan' },
    });
    fireEvent.click(screen.getByText('Jan Kowalski'));
    fireEvent.change(screen.getByPlaceholderText('Nr Rejestracyjny *'), { target: { value: 'wx1234a' } });
    fireEvent.change(screen.getByLabelText('Wielkość pojazdu'), { target: { value: 'Large' } });
    fireEvent.click(screen.getByText('Zapisz Pojazd'));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(createVehicle).toHaveBeenCalledWith({
      clientId: 'c1',
      licensePlate: 'WX1234A',
      brand: null,
      model: null,
      size: 'Large',
    });
  });
});
