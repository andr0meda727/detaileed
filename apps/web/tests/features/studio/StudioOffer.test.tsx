import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Listing } from '@detaileed/domain/listing';

const estimate = vi.fn();
vi.mock('@detaileed/api-client', async (orig) => ({
  ...(await orig<typeof import('@detaileed/api-client')>()),
  postApiPublicStudiosStudioIdEstimate: (...args: unknown[]) => estimate(...args),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams('size=Large') }));

const { StudioOffer } = await import('@/features/studio/components/StudioOffer');

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
  hasCompleteDetails: true,
  timeZone: 'Europe/Warsaw',
  categories: ['Interior', 'Ceramic'],
  services: [
    {
      id: 'a',
      name: 'Pranie tapicerki',
      category: 'Interior',
      prices: [
        { vehicleSize: 'Medium', price: 249 },
        { vehicleSize: 'Large', price: 349 },
      ],
    },
    { id: 'b', name: 'Powłoka ceramiczna', category: 'Ceramic', prices: [] },
  ],
  averageRating: null,
  reviewCount: 0,
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('StudioOffer', () => {
  it('shows prices for the size from the URL, estimates the picked services and links to the request', async () => {
    estimate.mockResolvedValue({
      services: [
        { serviceId: 'a', name: 'Pranie tapicerki', price: 349 },
        { serviceId: 'b', name: 'Powłoka ceramiczna', price: null },
      ],
      total: 349,
      hasUnpricedServices: true,
    });
    render(<StudioOffer listing={listing} />, { wrapper });

    expect(screen.getByText('349,00 zł')).toBeInTheDocument();
    expect(screen.getByText('na zapytanie')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();

    fireEvent.click(screen.getByLabelText(/Pranie tapicerki/));
    fireEvent.click(screen.getByLabelText(/Powłoka ceramiczna/));

    expect(await screen.findByText(/\+ wycena części usług/)).toBeInTheDocument();
    expect(estimate).toHaveBeenLastCalledWith('s1', { serviceIds: ['a', 'b'], vehicleSize: 'Large' });
    expect(screen.getByRole('link', { name: /Wyślij zapytanie/ })).toHaveAttribute(
      'href',
      '/studio/s1/book?services=a,b&size=Large',
    );
  });

  it('switches prices when the size changes', () => {
    render(<StudioOffer listing={listing} />, { wrapper });
    expect(screen.getByRole('radiogroup', { name: 'Wielkość auta' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Średnie' }));
    expect(screen.getByText('249,00 zł')).toBeInTheDocument();
  });
});
