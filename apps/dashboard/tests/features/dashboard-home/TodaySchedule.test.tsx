import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { BOOKING_STATUSES, type Booking } from '@/features/bookings';

vi.mock('@/features/studios', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/studios')>()),
  useStudioTimeZone: () => 'Europe/Warsaw',
}));

const { TodaySchedule } = await import('@/features/dashboard-home/components/TodaySchedule');

const booking = (overrides: Partial<Booking>): Booking => ({
  id: 'b1',
  scheduledAt: '2026-11-23T08:30:00Z',
  endsAt: '2026-11-23T10:00:00Z',
  completedAt: null,
  totalPrice: 2400,
  status: BOOKING_STATUSES.UTWORZONA.name,
  statusColor: null,
  notes: null,
  vehicle: { id: 'v1', brand: 'BMW', model: 'X5', licensePlate: 'WI 30551' } as Booking['vehicle'],
  client: { id: 'c1', name: 'Piotr Nowak' } as Booking['client'],
  services: ['Powłoka ceramiczna'],
  bay: { id: 'bay1', name: 'Stanowisko 1' },
  ...overrides,
});

const planned = booking({});
const done = booking({
  id: 'b2',
  scheduledAt: '2026-11-23T12:00:00Z',
  status: BOOKING_STATUSES.ZAKONCZONA.name,
  statusColor: null,
  client: { id: 'c2', name: 'Anna Kowalczyk' } as Booking['client'],
  services: [],
  bay: null,
});

function renderSchedule() {
  const onOpen = vi.fn();
  const onRequestStatusChange = vi.fn();
  render(
    <TodaySchedule
      bookings={[planned, done]}
      loading={false}
      onOpen={onOpen}
      onRequestStatusChange={onRequestStatusChange}
    />,
  );
  return { onOpen, onRequestStatusChange };
}

describe('TodaySchedule', () => {
  it('lists today’s bookings with time in the studio zone, client, car, services, bay, status and amount', () => {
    renderSchedule();
    const rows = within(screen.getByRole('table', { name: 'Dzisiejsze wizyty' })).getAllByRole('row');
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent('09:30');
    expect(rows[1]).toHaveTextContent('Piotr Nowak');
    expect(rows[1]).toHaveTextContent('BMW X5 · WI 30551');
    expect(rows[1]).toHaveTextContent('Powłoka ceramiczna');
    expect(rows[1]).toHaveTextContent('Stanowisko 1');
    expect(rows[1]).toHaveTextContent('Utworzona');
    expect(rows[1]).toHaveTextContent('2400,00 zł');
    expect(rows[2]).toHaveTextContent('Brak usług');
    expect(rows[2]).toHaveTextContent('—');
  });

  it('labels the values for the stacked cards on phones', () => {
    renderSchedule();
    expect(screen.getByRole('cell', { name: 'Powłoka ceramiczna' })).toHaveAttribute('data-label', 'Usługi');
    expect(screen.getByRole('cell', { name: 'Stanowisko 1' })).toHaveAttribute('data-label', 'Stanowisko');
    for (const amount of screen.getAllByRole('cell', { name: /zł$/ }))
      expect(amount).toHaveAttribute('data-label', 'Kwota');
  });

  it('opens a booking from its row and offers the status menu only for planned ones', () => {
    const { onOpen } = renderSchedule();
    fireEvent.click(screen.getByRole('button', { name: 'Anna Kowalczyk' }));
    expect(onOpen).toHaveBeenCalledWith(done);
    expect(screen.getAllByRole('button', { name: 'Więcej akcji' })).toHaveLength(1);
  });

  it('asks to complete a planned booking from the menu without opening it', () => {
    const { onOpen, onRequestStatusChange } = renderSchedule();
    fireEvent.keyDown(screen.getByRole('button', { name: 'Więcej akcji' }), { key: 'Enter' });
    fireEvent.click(screen.getByRole('menuitem', { name: 'Zakończ zlecenie' }));
    expect(onRequestStatusChange).toHaveBeenCalledWith(planned, BOOKING_STATUSES.ZAKONCZONA);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('shows an empty state when nothing is planned today', () => {
    render(<TodaySchedule bookings={[]} loading={false} onOpen={vi.fn()} onRequestStatusChange={vi.fn()} />);
    expect(screen.getByText('Brak zleceń na dziś')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
