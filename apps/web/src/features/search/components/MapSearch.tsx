'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SearchX } from 'lucide-react';
import type { ServiceCategory, VehicleSize } from '@detaileed/api-client';
import { EmptyState, Select, Skeleton } from '@detaileed/ui';
import type { Bounds } from '@detaileed/ui/map/geo';
import { SERVICE_CATEGORIES } from '@detaileed/domain/serviceCategory';
import { VEHICLE_SIZE_OPTIONS } from '@detaileed/domain/vehicleSize';
import { MAP_STYLE_URL } from '@/shared/lib/site';
import { PINS_PAGE_SIZE, useStudioPins } from '@/features/search/api/pins';
import { pinLabel } from '@/features/search/model/pins';
import { serializeSearch, type SearchState } from '@/features/search/model/searchState';
import { StudioCard } from '@/features/search/components/StudioCard';

// MapLibre needs a browser; load it only there.
const MapView = dynamic(() => import('@detaileed/ui/map').then((m) => m.MapView), {
  ssr: false,
  loading: () => <Skeleton width="100%" height="100%" className="rounded-2xl" />,
});

const CATEGORY_OPTIONS = [{ value: '', label: 'Wszystkie usługi' }, ...SERVICE_CATEGORIES];

/** The home page search: studios inside the visible map area as pins and a list, with category and size filters. */
export function MapSearch({ initial }: { initial: SearchState }) {
  const [state, setState] = useState(initial);
  const [bounds, setBounds] = useState<Bounds | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isFetching, isError } = useStudioPins(bounds, { category: state.category, size: state.size });
  const pins = data?.pins ?? [];

  // The URL follows the search without a server round trip, so it can be shared or bookmarked.
  const update = (next: SearchState) => {
    setState(next);
    const query = serializeSearch(next);
    window.history.replaceState(null, '', query ? `/?${query}` : '/');
  };

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-4 lg:h-[calc(100vh-11rem)] min-h-[520px]">
      <div className="order-2 lg:order-1 flex flex-col gap-3 min-h-0">
        <div className="grid grid-cols-2 gap-2">
          <Select
            aria-label="Rodzaj usługi"
            options={CATEGORY_OPTIONS}
            value={state.category ?? ''}
            onChange={(e) => update({ ...state, category: (e.target.value || null) as ServiceCategory | null })}
          />
          <Select
            aria-label="Wielkość auta"
            options={VEHICLE_SIZE_OPTIONS}
            value={state.size}
            onChange={(e) => update({ ...state, size: e.target.value as VehicleSize })}
          />
        </div>
        <p className="text-xs font-semibold text-green-light px-1" aria-live="polite">
          {isError
            ? 'Nie udało się pobrać studiów. Spróbuj przesunąć mapę.'
            : !data
              ? 'Szukamy studiów…'
              : data.totalCount > PINS_PAGE_SIZE
                ? `Pokazujemy ${PINS_PAGE_SIZE} z ${data.totalCount} studiów. Przybliż mapę, aby zobaczyć resztę.`
                : `${data.totalCount} studiów w tym obszarze${isFetching ? '…' : ''}`}
        </p>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
          {data && pins.length === 0 ? (
            <EmptyState message="Brak studiów w tym obszarze. Oddal mapę albo zmień filtry." icon={SearchX} />
          ) : (
            pins.map((pin) => (
              <StudioCard
                key={pin.studioId}
                pin={pin}
                size={state.size}
                selected={pin.studioId === selectedId}
                onHover={() => setSelectedId(pin.studioId)}
              />
            ))
          )}
        </div>
      </div>
      <div className="order-1 lg:order-2 h-[50vh] lg:h-full">
        <MapView
          pins={pins.map((p) => ({ id: p.studioId, lat: p.lat, lng: p.lng, label: pinLabel(p) }))}
          selectedId={selectedId}
          onPinClick={setSelectedId}
          onBoundsChange={(b, view) => {
            setBounds(b);
            update({ ...state, lat: view.lat, lng: view.lng, zoom: view.zoom });
          }}
          initialView={{ lat: initial.lat, lng: initial.lng, zoom: initial.zoom }}
          styleUrl={MAP_STYLE_URL}
          height="100%"
          geolocate
        />
      </div>
    </div>
  );
}
