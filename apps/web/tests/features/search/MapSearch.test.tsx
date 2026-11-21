import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DEFAULT_SEARCH } from '@/features/search/model/searchState';

const getApiPublicStudios = vi.fn();
vi.mock('@detaileed/api-client', async (orig) => ({
  ...(await orig<typeof import('@detaileed/api-client')>()),
  getApiPublicStudios: (...args: unknown[]) => getApiPublicStudios(...args),
}));

// The map is a button that reports a visible area, as MapLibre does once loaded.
vi.mock('next/dynamic', () => ({
  default: () =>
    function FakeMap({
      onBoundsChange,
      pins,
    }: {
      onBoundsChange: (b: object, v: object) => void;
      pins: { id: string; label: string }[];
    }) {
      return (
        <div>
          <button
            onClick={() =>
              onBoundsChange(
                { minLat: 50, maxLat: 50.1, minLng: 19.8, maxLng: 20.1 },
                { lat: 50.05, lng: 19.95, zoom: 11 },
              )
            }
          >
            mapa
          </button>
          {pins.map((p) => (
            <span key={p.id}>{p.label}</span>
          ))}
        </div>
      );
    },
}));

const { MapSearch } = await import('@/features/search/components/MapSearch');

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

describe('MapSearch', () => {
  beforeEach(() => {
    getApiPublicStudios.mockReset();
    getApiPublicStudios.mockResolvedValue({
      items: [
        {
          studioId: 's1',
          name: 'Detail Kraków',
          city: 'Kraków',
          latitude: 50.06,
          longitude: 19.94,
          categories: ['Interior'],
          fromPrice: 89,
          averageRating: 4.7,
          reviewCount: 12,
        },
      ],
      totalCount: 1,
    });
  });

  it('searches the visible area and lists the studios with links for the chosen size', async () => {
    render(<MapSearch initial={DEFAULT_SEARCH} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'mapa' }));

    expect(await screen.findByText('Detail Kraków')).toBeInTheDocument();
    expect(screen.getByText('od 89 zł')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Detail Kraków/ })).toHaveAttribute('href', '/studio/s1?size=Medium');
    expect(getApiPublicStudios).toHaveBeenCalledWith(
      expect.objectContaining({ MinLat: 50, MaxLat: 50.1, VehicleSize: 'Medium', Category: undefined }),
      expect.anything(),
    );
    expect(window.location.search).toBe('?lat=50.0500&lng=19.9500&z=11.0');
  });

  it('filters by category and car size, keeping them in the URL', async () => {
    render(<MapSearch initial={DEFAULT_SEARCH} />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'mapa' }));
    await screen.findByText('Detail Kraków');

    fireEvent.change(screen.getByLabelText('Rodzaj usługi'), { target: { value: 'Ceramic' } });
    fireEvent.change(screen.getByLabelText('Wielkość auta'), { target: { value: 'Large' } });

    await waitFor(() =>
      expect(getApiPublicStudios).toHaveBeenLastCalledWith(
        expect.objectContaining({ Category: 'Ceramic', VehicleSize: 'Large' }),
        expect.anything(),
      ),
    );
    expect(window.location.search).toContain('category=Ceramic&size=Large');
  });
});
