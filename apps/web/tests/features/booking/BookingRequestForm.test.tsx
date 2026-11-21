import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@detaileed/api-client';
import type { Listing } from '@detaileed/domain/listing';

const availability = vi.fn();
const mutate = vi.fn();
const push = vi.fn();
vi.mock('@detaileed/api-client', async (orig) => ({
  ...(await orig<typeof import('@detaileed/api-client')>()),
  getApiPublicStudiosStudioIdAvailability: (...args: unknown[]) => availability(...args),
  postApiPublicStudiosStudioIdEstimate: async () => ({ services: [], total: 349, hasUnpricedServices: false }),
}));
vi.mock('@/features/account/api/me', () => ({ useSubmitRequest: () => ({ mutate, isPending: false }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const { BookingRequestForm } = await import('@/features/booking/components/BookingRequestForm');

const listing: Listing = {
  studioId: 's1',
  name: 'Detail Kraków',
  description: null,
  address: 'ul. Długa 1',
  city: 'Kraków',
  phone: null,
  latitude: 50.06,
  longitude: 19.94,
  isPublished: true,
  timeZone: 'Europe/Warsaw',
  categories: ['Interior'],
  services: [
    { id: 'a', name: 'Pranie tapicerki', category: 'Interior', prices: [{ vehicleSize: 'Large', price: 349 }] },
  ],
  averageRating: null,
  reviewCount: 0,
};
const garage = [{ id: 'car1', licensePlate: 'KR 12345', brand: 'Volvo', model: 'XC90', size: 'Large' as const }];

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);
const renderForm = (g = garage) =>
  render(<BookingRequestForm listing={listing} garage={g} initialServiceIds={['a']} initialSize="Medium" />, {
    wrapper,
  });

describe('BookingRequestForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends a garage car and a free slot, and goes to the history', async () => {
    availability.mockResolvedValue({
      planningEnabled: true,
      durationMinutes: 90,
      timeZone: 'Europe/Warsaw',
      slots: [{ start: '2030-01-07T08:00:00Z', end: '2030-01-07T09:30:00Z' }],
    });
    mutate.mockImplementation((_body, opts) => opts.onSuccess());
    renderForm();

    fireEvent.click(screen.getByLabelText(/Volvo/));
    fireEvent.click(await screen.findByRole('radio', { name: '09:00' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wyślij zapytanie' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        {
          studioId: 's1',
          serviceIds: ['a'],
          vehicleId: 'car1',
          vehicle: null,
          preferredAt: '2030-01-07T08:00:00Z',
          notes: null,
        },
        expect.anything(),
      ),
    );
    expect(availability).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ ServiceIds: ['a'], VehicleSize: 'Large' }),
    );
    expect(push).toHaveBeenCalledWith('/account/bookings?sent=1');
  });

  it('asks for a slot and shows the API error in Polish', async () => {
    availability.mockResolvedValue({
      planningEnabled: true,
      durationMinutes: 90,
      timeZone: '',
      slots: [{ start: '2030-01-07T08:00:00Z', end: '2030-01-07T09:30:00Z' }],
    });
    mutate.mockImplementation((_body, opts) => opts.onError(new ApiError(409, { code: 'BOOKING_REQUEST_LIMIT' })));
    renderForm();
    fireEvent.click(screen.getByLabelText(/Volvo/));
    await screen.findByRole('radio', { name: '09:00' });

    fireEvent.click(screen.getByRole('button', { name: 'Wyślij zapytanie' }));
    expect(await screen.findByText('Wybierz wolny termin')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('radio', { name: '09:00' }));
    fireEvent.click(screen.getByRole('button', { name: 'Wyślij zapytanie' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/3 zapytania/);
  });

  it('takes a typed car and a preferred time when the studio does not plan', async () => {
    availability.mockResolvedValue({ planningEnabled: false, durationMinutes: 60, timeZone: '', slots: [] });
    renderForm([]);
    fireEvent.change(screen.getByLabelText('Nr rejestracyjny'), { target: { value: 'kr 999' } });
    fireEvent.change(await screen.findByLabelText('Dzień'), { target: { value: '2030-01-07' } });
    fireEvent.change(screen.getByLabelText('Godzina'), { target: { value: '09:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Wyślij zapytanie' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicleId: null,
          vehicle: { licensePlate: 'KR 999', brand: null, model: null, size: 'Medium' },
          preferredAt: '2030-01-07T08:00:00.000Z',
        }),
        expect.anything(),
      ),
    );
  });
});
