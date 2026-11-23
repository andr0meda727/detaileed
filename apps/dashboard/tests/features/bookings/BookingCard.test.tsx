import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Booking } from '@/features/bookings';

vi.mock('@/features/studios', () => ({ useStudioTimeZone: () => 'Europe/Warsaw' }));

const { BookingCard } = await import('@/features/bookings/components/BookingCard');
const { BookingStatusBadge } = await import('@/features/bookings/components/BookingStatusBadge');
const { BOOKING_STATUSES, bookingStatusTone } = await import('@/features/bookings/model/statuses');

const booking = (status: string) =>
  ({
    id: 'b1',
    status,
    statusColor: '#123456',
    scheduledAt: '2026-11-16T09:00:00Z',
    endsAt: '2026-11-16T10:30:00Z',
    vehicle: { licensePlate: 'WX 4821K', brand: 'Skoda', model: 'Octavia' },
    client: { name: 'Anna Nowak' },
    services: ['Mycie'],
    bay: null,
  }) as unknown as Booking;

describe('bookingStatusTone', () => {
  it('maps the known statuses to tones and leaves others out', () => {
    expect(bookingStatusTone('Utworzona')).toBe('info');
    expect(bookingStatusTone('Zakończona')).toBe('success');
    expect(bookingStatusTone('Anulowana')).toBe('danger');
    expect(bookingStatusTone('Inna')).toBeUndefined();
    expect(bookingStatusTone(null)).toBeUndefined();
  });
});

describe('BookingStatusBadge', () => {
  it('uses the API colour only on the dot of an unknown status', () => {
    const { container, rerender } = render(<BookingStatusBadge booking={booking('Inna')} />);
    expect(container.querySelector<HTMLElement>('[data-slot="dot"]')?.style.backgroundColor).not.toBe('');

    rerender(<BookingStatusBadge booking={booking('Anulowana')} />);
    expect(container.querySelector<HTMLElement>('[data-slot="dot"]')?.style.backgroundColor).toBe('');
    expect(screen.getByText('Anulowana')).toHaveClass('text-danger');
  });
});

describe('BookingCard', () => {
  it('opens the details and offers complete or cancel for an open booking', () => {
    const onOpen = vi.fn();
    const onRequestStatusChange = vi.fn();
    const open = booking('Utworzona');
    render(<BookingCard booking={open} onOpen={onOpen} onRequestStatusChange={onRequestStatusChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Szczegóły rezerwacji WX 4821K/ }));
    expect(onOpen).toHaveBeenCalledWith(open);

    fireEvent.keyDown(screen.getByRole('button', { name: 'Więcej akcji' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Anuluj zlecenie' }));
    expect(onRequestStatusChange).toHaveBeenCalledWith(open, BOOKING_STATUSES.ANULOWANA);
  });

  it('has no menu for a finished booking', () => {
    render(<BookingCard booking={booking('Zakończona')} onOpen={vi.fn()} onRequestStatusChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Więcej akcji' })).not.toBeInTheDocument();
  });
});
