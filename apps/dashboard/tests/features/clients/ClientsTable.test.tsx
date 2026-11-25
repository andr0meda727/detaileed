import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ClientsTable } from '@/features/clients/components/ClientsTable';
import type { Client } from '@/features/clients/model/types';

const client: Client = {
  id: 'c1',
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  phone: '500600700',
  nip: null,
  vehicles: [
    { id: 'v1', licensePlate: 'WX1234A', brand: 'BMW', model: 'M3', size: 'Medium' },
    { id: 'v2', licensePlate: 'WX1234B', brand: 'Audi', model: 'A4', size: 'Medium' },
    { id: 'v3', licensePlate: 'WX1234C', brand: 'Kia', model: 'Ceed', size: 'Small' },
  ],
};

describe('ClientsTable', () => {
  it('lists clients with two vehicles and a count of the rest', () => {
    render(<ClientsTable clients={[client]} isLoading={false} dimmed={false} onOpen={vi.fn()} onEdit={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Jan Kowalski' })).toBeInTheDocument();
    expect(screen.getByText('BMW M3')).toBeInTheDocument();
    expect(screen.queryByText('Kia Ceed')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zadzwoń: Jan Kowalski' })).toHaveAttribute('href', 'tel:500600700');
  });

  it('opens a client from the row and edits without opening', () => {
    const onOpen = vi.fn();
    const onEdit = vi.fn();
    render(<ClientsTable clients={[client]} isLoading={false} dimmed={false} onOpen={onOpen} onEdit={onEdit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edytuj klienta: Jan Kowalski' }));
    expect(onEdit).toHaveBeenCalledWith(client);
    expect(onOpen).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Jan Kowalski' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('says when nothing matches', () => {
    render(<ClientsTable clients={[]} isLoading={false} dimmed={false} onOpen={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText('Nie znaleziono klientów.')).toBeInTheDocument();
  });
});
