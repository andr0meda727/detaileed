import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/shared/ui/ToastContext';
import type { Client } from '@/features/clients/model/types';

// The API sends sizes as strings ("Medium"); the spec types them as numbers, so cast.
const size = 'Medium' as unknown as Client['vehicles'][number]['size'];

const client: Client = {
  id: 'c1',
  name: 'Jan Kowalski',
  email: null,
  phone: '500600700',
  nip: null,
  vehicles: [{ id: 'v1', licensePlate: 'WX1234A', brand: 'BMW', model: 'M3', size }],
};
const created: Client = { ...client, id: 'c2', name: 'Anna Nowak', vehicles: [{ ...client.vehicles[0], id: 'v2' }] };
const createClient = vi.fn(async () => created);

// The picker only needs the client list and the create mutation; no network.
vi.mock('@/features/clients/api/clients', () => ({
  useClients: () => ({ data: [client] }),
  useCreateClient: () => ({ mutateAsync: createClient }),
}));

const { default: ClientVehiclePicker } = await import('@/features/clients/components/ClientVehiclePicker');

const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;

describe('ClientVehiclePicker', () => {
  it('picks a vehicle found by plate', () => {
    const onChange = vi.fn();
    render(<ClientVehiclePicker value={null} onChange={onChange} />, { wrapper });

    fireEvent.change(screen.getByPlaceholderText('Szukaj klienta lub pojazdu...'), { target: { value: 'wx12' } });
    fireEvent.click(screen.getByText('BMW M3'));

    expect(onChange).toHaveBeenCalledWith({ client, vehicle: client.vehicles[0] });
  });

  it('shows validation errors inline and does not create an invalid client', async () => {
    render(<ClientVehiclePicker value={null} onChange={vi.fn()} />, { wrapper });
    fireEvent.click(screen.getByText('Dodaj Nowy'));
    fireEvent.click(screen.getByText('Dodaj Klienta i Wybierz'));

    expect(await screen.findByText('Imię i nazwisko jest wymagane (min. 2 znaki)')).toBeInTheDocument();
    expect(screen.getByText('Numer rejestracyjny jest wymagany (min. 3 znaki)')).toBeInTheDocument();
    expect(createClient).not.toHaveBeenCalled();
  });

  it('creates a client with a vehicle and picks it', async () => {
    const onChange = vi.fn();
    render(<ClientVehiclePicker value={null} onChange={onChange} />, { wrapper });
    fireEvent.click(screen.getByText('Dodaj Nowy'));
    fireEvent.change(screen.getByPlaceholderText('Imię i Nazwisko *'), { target: { value: 'Anna Nowak' } });
    fireEvent.change(screen.getByPlaceholderText('Telefon *'), { target: { value: '500600700' } });
    fireEvent.change(screen.getByPlaceholderText('Nr Rejestracyjny *'), { target: { value: 'wx999' } });
    fireEvent.click(screen.getByText('Dodaj Klienta i Wybierz'));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith({ client: created, vehicle: created.vehicles[0] }));
    expect(createClient).toHaveBeenCalledWith({
      name: 'Anna Nowak',
      phone: '500600700',
      email: null,
      nip: null,
      vehicle: { licensePlate: 'WX999', brand: null, model: null },
    });
  });
});
