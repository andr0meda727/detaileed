import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import type { MyRequest } from '@/features/account/model/requests';

const withdraw = vi.fn();
const base: MyRequest = {
  id: 'r1',
  studioId: 's1',
  studioName: 'Detail Kraków',
  status: 'Pending',
  preferredAt: '2026-11-20T08:00:00Z',
  vehicle: { licensePlate: 'KR 12345', brand: 'Volvo', model: 'XC90', size: 'Large' },
  services: [{ serviceId: 'a', name: 'Pranie tapicerki', price: 349 }],
  estimatedPrice: 349,
  hasUnpricedServices: false,
  rejectionReason: null,
  createdAt: '2026-11-16T10:00:00Z',
  booking: null,
};
vi.mock('@/features/account/api/me', () => ({
  useMyRequests: () => ({
    isLoading: false,
    data: {
      totalPages: 1,
      items: [
        base,
        {
          ...base,
          id: 'r2',
          status: 'Accepted',
          booking: { scheduledAt: '2026-11-21T09:00:00Z', status: 'Utworzona', totalPrice: 360 },
        },
        { ...base, id: 'r3', status: 'Rejected', rejectionReason: 'Brak terminów' },
      ],
    },
  }),
  useWithdrawRequest: () => ({ mutate: withdraw, isPending: false }),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams('wyslano=1') }));

const { default: MyRequestsView } = await import('@/features/account/components/MyRequestsView');

describe('MyRequestsView', () => {
  it('shows each status with what the customer needs and lets them withdraw a pending one', () => {
    render(<MyRequestsView />, {
      wrapper: ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>,
    });
    expect(screen.getByRole('status')).toHaveTextContent('Zapytanie wysłane');
    expect(screen.getByText('Czeka na odpowiedź')).toBeInTheDocument();
    expect(screen.getByText(/Termin: .*10:00 · 360,00 zł/)).toBeInTheDocument();
    expect(screen.getByText('Studio: Brak terminów')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button', { name: 'Wycofaj zapytanie' });
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    expect(withdraw).toHaveBeenCalledWith('r1', expect.anything());
  });
});
