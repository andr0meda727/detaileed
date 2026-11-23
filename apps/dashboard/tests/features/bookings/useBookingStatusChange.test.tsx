import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Booking } from '@/features/bookings';

const complete = vi.fn(() => Promise.resolve());
const cancel = vi.fn(() => Promise.resolve());
const addToast = vi.fn();
vi.mock('@/features/bookings/api/bookings', () => ({
  useCompleteBooking: () => ({ mutateAsync: complete, isPending: false }),
  useCancelBooking: () => ({ mutateAsync: cancel, isPending: false }),
}));
vi.mock('@detaileed/ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@detaileed/ui')>()),
  useToast: () => ({ addToast }),
}));

const { useBookingStatusChange } = await import('@/features/bookings/hooks/useBookingStatusChange');
const { BOOKING_STATUSES } = await import('@/features/bookings/model/statuses');

const booking = {
  id: 'b1',
  vehicle: { licensePlate: 'WX 4821K', brand: 'Skoda', model: 'Octavia' },
} as unknown as Booking;

function Harness() {
  const { requestStatusChange, confirmDialog } = useBookingStatusChange();
  return (
    <>
      <button type="button" onClick={() => requestStatusChange(booking, BOOKING_STATUSES.ANULOWANA)}>
        Anuluj
      </button>
      {confirmDialog}
    </>
  );
}

describe('useBookingStatusChange', () => {
  it('asks before cancelling and cancels on confirm', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Anuluj' }));

    const dialog = screen.getByRole('alertdialog', { name: 'Anulować tę rezerwację?' });
    expect(dialog).toHaveTextContent('WX 4821K');
    fireEvent.click(screen.getByRole('button', { name: 'Tak, kontynuuj' }));

    await waitFor(() => expect(cancel).toHaveBeenCalledWith('b1'));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(complete).not.toHaveBeenCalled();
  });
});
