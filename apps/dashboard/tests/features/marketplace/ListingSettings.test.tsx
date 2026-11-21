import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { ToastProvider } from '@detaileed/ui';
import { StudioScope } from '@/features/studios/model/StudioContext';
import type { Listing } from '@/features/marketplace/model/types';

const state = vi.hoisted(() => ({ listing: null as Listing | null }));
const save = vi.fn();
const publish = vi.fn();
const unpublish = vi.fn();
const openStudio = vi.fn();

// No network: the api hooks are replaced.
vi.mock('@/features/marketplace/api/listing', () => ({
  useListing: () => ({ data: state.listing, isLoading: false }),
  useSaveListing: () => ({ mutate: save, isPending: false }),
  usePublishListing: () => ({ mutate: publish, isPending: false }),
  useUnpublishListing: () => ({ mutate: unpublish, isPending: false }),
}));

const { ListingSettings } = await import('@/features/marketplace/components/ListingSettings');

const listing: Listing = {
  studioId: 's1',
  name: 'Detail Kraków',
  description: null,
  address: 'ul. Długa 1',
  city: 'Kraków',
  phone: '500 600 700',
  latitude: 50.06,
  longitude: 19.94,
  isPublished: true,
  hasCompleteDetails: true,
  timeZone: 'Europe/Warsaw',
  categories: ['Interior'],
  services: [{ id: 'x', name: 'Pranie', category: 'Interior', prices: [] }],
  averageRating: 4.7,
  reviewCount: 12,
};

const unplaced: Listing = {
  ...listing,
  isPublished: false,
  address: null,
  city: null,
  latitude: null,
  longitude: null,
  hasCompleteDetails: false,
};

const renderAs = (role: string) =>
  render(<ListingSettings onOpenServices={vi.fn()} onOpenStudio={openStudio} />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ToastProvider>
        <StudioScope
          studio={{ studioId: 's1', name: 'Detail Kraków', role, address: 'ul. Długa 1', timeZone: 'Europe/Warsaw' }}
        >
          {children}
        </StudioScope>
      </ToastProvider>
    ),
  });

describe('ListingSettings', () => {
  beforeEach(() => {
    state.listing = null;
    save.mockClear();
    openStudio.mockClear();
  });

  it('saves only the description of a new profile', async () => {
    renderAs('Owner');
    expect(screen.getByText('Detail Kraków')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Opis'), { target: { value: ' Ceramika i pranie ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz profil' }));

    await waitFor(() => expect(save).toHaveBeenCalledWith({ description: 'Ceramika i pranie' }, expect.anything()));
  });

  it('shows the details copied from the studio and links to the studio settings', () => {
    state.listing = listing;
    renderAs('Owner');
    expect(screen.getByText('ul. Długa 1, Kraków')).toBeInTheDocument();
    expect(screen.getByText('500 600 700')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Zmień w ustawieniach studia' }));
    expect(openStudio).toHaveBeenCalled();
  });

  it('shows a published profile with its rating and lets the owner hide it', () => {
    state.listing = listing;
    renderAs('Owner');
    expect(screen.getByText('Opublikowany')).toBeInTheDocument();
    expect(screen.getByText('4,7 (12 opinii)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ukryj' }));
    expect(unpublish).toHaveBeenCalled();
  });

  it('does not let the owner publish a studio without services', () => {
    state.listing = { ...listing, isPublished: false, services: [] };
    renderAs('Owner');
    expect(screen.getByRole('button', { name: 'Opublikuj' })).toBeDisabled();
    expect(screen.getByText(/nie ma jeszcze usług/)).toBeInTheDocument();
  });

  it('does not let the owner publish a studio without an address and pin, and points to the studio settings', () => {
    state.listing = unplaced;
    renderAs('Owner');
    expect(screen.getByRole('button', { name: 'Opublikuj' })).toBeDisabled();
    expect(screen.getByText('Brak adresu')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Uzupełnij dane studia' }));
    expect(openStudio).toHaveBeenCalled();
  });

  it('is read-only for other members', () => {
    state.listing = listing;
    renderAs('Employee');
    expect(screen.queryByRole('button', { name: 'Zapisz profil' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ukryj' })).toBeNull();
    expect(screen.getByLabelText('Opis')).toBeDisabled();
  });
});
