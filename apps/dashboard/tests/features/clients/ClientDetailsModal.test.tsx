import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClientDetailsModal } from '@/features/clients/components/ClientDetailsModal';
import type { Client } from '@/features/clients/model/types';

const client: Client = {
  id: 'c1',
  name: 'Jan Kowalski',
  email: null,
  phone: '',
  nip: '1234567890',
  vehicles: [{ id: 'v1', licensePlate: 'WX1234A', brand: 'BMW', model: 'M3', size: 'Medium' }],
};

const handlers = {
  onClose: vi.fn(),
  onEditClient: vi.fn(),
  onAddVehicle: vi.fn(),
  onEditVehicle: vi.fn(),
  onDeleteVehicle: vi.fn(),
};

describe('ClientDetailsModal', () => {
  it('shows the client with vehicle actions', () => {
    render(<ClientDetailsModal client={client} {...handlers} />);

    expect(screen.getByRole('dialog', { name: 'Karta klienta' })).toBeInTheDocument();
    expect(screen.getByText('BMW M3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Edytuj pojazd WX1234A' }));
    expect(handlers.onEditVehicle).toHaveBeenCalledWith('v1');
    fireEvent.click(screen.getByRole('button', { name: 'Usuń pojazd WX1234A' }));
    expect(handlers.onDeleteVehicle).toHaveBeenCalledWith('v1');
    fireEvent.click(screen.getByRole('button', { name: 'Edytuj klienta' }));
    expect(handlers.onEditClient).toHaveBeenCalledWith(client);
  });

  it('disables calling without a phone number', () => {
    render(<ClientDetailsModal client={client} {...handlers} />);
    expect(screen.getByRole('button', { name: 'Brak numeru' })).toBeDisabled();
  });
});
