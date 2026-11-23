'use client';

import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { postApiPublicStudiosStudioIdEstimate, VehicleSize } from '@detaileed/api-client';
import { SegmentedControl } from '@detaileed/ui';
import type { Listing } from '@detaileed/domain/listing';
import { VEHICLE_SIZES, vehicleSizeLabel } from '@detaileed/domain/vehicleSize';
import { EstimateCard } from '@/features/studio/components/EstimateCard';
import { OfferServices } from '@/features/studio/components/OfferServices';

const isSize = (v: string | null): v is VehicleSize => Object.values(VehicleSize).includes(v as VehicleSize);

const SIZE_OPTIONS = VEHICLE_SIZES.map((s) => ({ value: s.value, label: s.short }));

interface StudioOfferProps {
  listing: Listing;
  /** Shown under the estimate in the side column (the studio's location). */
  aside?: ReactNode;
}

/**
 * The studio's services with prices for the chosen car size; pick some to see an estimate and send a request.
 * Renders two grid items for the page's two-column grid: the services (first column, first row) and a side column
 * with the sticky estimate card (second column, spanning two rows), so the page can put more below the services.
 */
export function StudioOffer({ listing, aside }: StudioOfferProps) {
  const searchParams = useSearchParams();
  const initialSize = searchParams.get('size');
  const [size, setSize] = useState<VehicleSize>(isSize(initialSize) ? initialSize : VehicleSize.Medium);
  const [selected, setSelected] = useState<string[]>([]);

  const estimate = useQuery({
    queryKey: ['estimate', listing.studioId, selected, size],
    queryFn: () => postApiPublicStudiosStudioIdEstimate(listing.studioId, { serviceIds: selected, vehicleSize: size }),
    enabled: selected.length > 0,
    placeholderData: keepPreviousData,
  });

  const toggle = (id: string) => setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const bookHref = `/studio/${listing.studioId}/book?services=${selected.join(',')}&size=${size}`;

  return (
    <>
      <section className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-1" aria-labelledby="offer-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="offer-heading" className="text-xl font-semibold tracking-tight text-foreground">
            Usługi i ceny
          </h2>
          <SegmentedControl
            aria-label="Wielkość auta"
            options={SIZE_OPTIONS}
            value={size}
            onValueChange={setSize}
            className="w-full sm:w-auto sm:min-w-[340px]"
            fullWidth
          />
        </div>
        <OfferServices services={listing.services} size={size} selected={selected} onToggle={toggle} />
      </section>
      <aside className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1" aria-label="Wycena">
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          <EstimateCard
            sizeLabel={vehicleSizeLabel(size).toLowerCase()}
            selectedCount={selected.length}
            estimate={selected.length > 0 ? estimate.data : undefined}
            bookHref={bookHref}
          />
          {aside}
        </div>
      </aside>
    </>
  );
}
