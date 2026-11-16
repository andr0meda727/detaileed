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

// No network: the api hooks are replaced, and the map is a button that drops a pin.
vi.mock('@/features/marketplace/api/listing', () => ({
  useListing: () => ({ data: state.listing, isLoading: false }),
  useSaveListing: () => ({ mutate: save, isPending: false }),
  usePublishListing: () => ({ mutate: publish, isPending: false }),
  useUnpublishListing: () => ({ mutate: unpublish, isPending: false }),
}));
vi.mock('@detaileed/ui/map', () => ({
  MapPicker: ({ onChange, readOnly }: { onChange: (p: { lat: number; lng: number }) => void; readOnly?: boolean }) => (
    <button type="button" disabled={readOnly} onClick={() => onChange({ lat: 50.06, lng: 19.94 })}>
      mapa
    </button>
  ),
}));

const { default: ListingSettings } = await import('@/features/marketplace/components/ListingSettings');

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
  services: [{ id: 'x', name: 'Pranie', category: 'Interior', prices: [] }],
  averageRating: 4.7,
  reviewCount: 12,
};

const renderAs = (role: string) =>
  render(<ListingSettings onOpenServices={vi.fn()} />, {
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
  });

  it('prefills a new profile from the studio and asks for a pin before saving', async () => {
    renderAs('Owner');
    expect(screen.getByDisplayValue('Detail Kraków')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Kraków'), { target: { value: 'Kraków' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz profil' }));
    expect(await screen.findByText('Zaznacz studio na mapie')).toBeInTheDocument();
    expect(save).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('button', { name: 'mapa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zapisz profil' }));
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith(
        {
          name: 'Detail Kraków',
          description: null,
          address: 'ul. Długa 1',
          city: 'Kraków',
          phone: null,
          latitude: 50.06,
          longitude: 19.94,
        },
        expect.anything(),
      ),
    );
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
    expect(screen.getByText(/nie można go opublikować/)).toBeInTheDocument();
  });

  it('is read-only for other members', () => {
    state.listing = listing;
    renderAs('Employee');
    expect(screen.queryByRole('button', { name: 'Zapisz profil' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Ukryj' })).toBeNull();
    expect(screen.getByDisplayValue('Detail Kraków')).toBeDisabled();
  });
});
