import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import type { BookingRequest, RequestPlan } from '@/features/booking-requests/model/types';

const accept = vi.fn();
const reject = vi.fn();
const plan: RequestPlan = {
  planningEnabled: true,
  durationMinutes: 90,
  preferred: {
    start: '2026-11-20T08:00:00Z',
    end: '2026-11-20T09:30:00Z',
    fits: false,
    withinOpeningHours: true,
    bayId: null,
    bayName: null,
  },
  alternatives: [
    {
      start: '2026-11-20T10:00:00Z',
      end: '2026-11-20T11:30:00Z',
      bayId: 'bay2',
      bayName: 'Stanowisko 2',
      minutesFromPreferred: 120,
    },
  ],
  competingRequests: [{ id: 'r2', preferredAt: '2026-11-20T08:00:00Z', customerName: 'Jan Kowalski' }],
};

// No network: the request hooks are replaced.
vi.mock('@/features/booking-requests/api/requests', () => ({
  useRequestPlan: () => ({ data: plan, isLoading: false }),
  useAcceptRequest: () => ({ mutate: accept, isPending: false }),
  useRejectRequest: () => ({ mutate: reject, isPending: false }),
}));

const { default: RequestDetailsModal } = await import('@/features/booking-requests/components/RequestDetailsModal');

const request: BookingRequest = {
  id: 'r1',
  status: 'Pending',
  preferredAt: '2026-11-20T08:00:00Z',
  customerName: 'Anna Nowak',
  customerPhone: '500600700',
  customerEmail: 'anna@example.com',
  vehicle: { licensePlate: 'KR 12345', brand: 'Volvo', model: 'XC90', size: 'Large' },
  services: [{ serviceId: 'a', name: 'Mycie', price: 89 }],
  estimatedPrice: 89,
  hasUnpricedServices: false,
  notes: 'Psia sierść',
  rejectionReason: null,
  createdAt: '2026-11-16T10:00:00Z',
  decidedAt: null,
  booking: null,
};

const wrapper = ({ children }: { children: ReactNode }) => <ToastProvider>{children}</ToastProvider>;
const renderModal = (r: BookingRequest | null = request, missing = false) =>
  render(<RequestDetailsModal request={r} missing={missing} timeZone="Europe/Warsaw" onClose={vi.fn()} />, {
    wrapper,
  });

describe('RequestDetailsModal', () => {
  it('shows the request and the plan, and accepts it on a picked free slot and bay', async () => {
    renderModal();
    expect(screen.getByText('Anna Nowak')).toBeInTheDocument();
    expect(screen.getByText('Psia sierść')).toBeInTheDocument();
    expect(screen.getByText(/nie ma wolnego stanowiska/)).toBeInTheDocument();
    expect(screen.getByText(/Jan Kowalski/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Stanowisko 2/ }));
    expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Przyjmij i dodaj do kalendarza' }));

    await vi.waitFor(() =>
      expect(accept).toHaveBeenCalledWith(
        { id: 'r1', body: { scheduledAt: '2026-11-20T10:00:00.000Z', price: 89, bayId: 'bay2' } },
        expect.anything(),
      ),
    );
  });

  it('rejects with a reason', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Odrzuć' }));
    fireEvent.change(screen.getByLabelText('Powód (klient go zobaczy)'), { target: { value: 'Brak terminów' } });
    fireEvent.click(screen.getByRole('button', { name: 'Odrzuć zapytanie' }));
    expect(reject).toHaveBeenCalledWith({ id: 'r1', reason: 'Brak terminów' }, expect.anything());
  });

  it('only shows a decided request', () => {
    renderModal({ ...request, status: 'Rejected', rejectionReason: 'Brak terminów' });
    expect(screen.getByText('Powód odrzucenia: Brak terminów')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Przyjmij' })).toBeNull();
  });

  it('explains a request that is not on the list', () => {
    renderModal(null, true);
    expect(screen.getByText(/Nie znaleziono tego zapytania/)).toBeInTheDocument();
  });
});
