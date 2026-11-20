'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Check, Send } from 'lucide-react';
import { postApiPublicStudiosStudioIdEstimate, VehicleSize } from '@detaileed/api-client';
import { Select } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { priceFor, servicesByCategory, type Listing } from '@detaileed/domain/listing';
import { serviceCategoryLabel } from '@detaileed/domain/serviceCategory';
import { VEHICLE_SIZE_OPTIONS } from '@detaileed/domain/vehicleSize';

const isSize = (v: string | null): v is VehicleSize => Object.values(VehicleSize).includes(v as VehicleSize);

/** The studio's services with prices for the chosen car size; pick some to see an estimate and send a request. */
export default function StudioOffer({ listing }: { listing: Listing }) {
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
    <section className="space-y-5" aria-labelledby="offer-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="offer-heading" className="font-serif text-3xl">
          Usługi i ceny
        </h2>
        <div className="w-64">
          <Select
            label="Wielkość auta"
            options={VEHICLE_SIZE_OPTIONS}
            value={size}
            onChange={(e) => setSize(e.target.value as VehicleSize)}
          />
        </div>
      </div>

      {servicesByCategory(listing.services).map((group) => (
        <div key={group.category}>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-green-light mb-2">
            {serviceCategoryLabel(group.category)}
          </h3>
          <ul className="divide-y divide-green-deep/5 bg-white rounded-2xl border border-green-deep/5">
            {group.services.map((service) => {
              const price = priceFor(service, size);
              const isSelected = selected.includes(service.id);
              return (
                <li key={service.id}>
                  <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-cream/50">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => toggle(service.id)}
                    />
                    <span
                      aria-hidden
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-green-deep border-green-deep' : 'border-green-deep/20'}`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} className="text-cream-warm" />}
                    </span>
                    <span className="flex-1 font-semibold">{service.name}</span>
                    <span className="text-sm text-green-light whitespace-nowrap">
                      {price === null ? 'na zapytanie' : `${formatPln(price)} zł`}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <div className="sticky bottom-4 bg-green-deep text-cream-warm rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div aria-live="polite">
          {selected.length === 0 ? (
            <p className="text-sm">Zaznacz usługi, aby zobaczyć szacunkową cenę.</p>
          ) : (
            <>
              <p className="text-xs uppercase tracking-widest text-cream-warm/60">Szacunkowo dla Twojego auta</p>
              <p className="text-2xl font-bold">
                {estimate.data ? `${formatPln(Number(estimate.data.total))} zł` : '…'}
                {estimate.data?.hasUnpricedServices && (
                  <span className="text-sm font-normal"> + wycena części usług</span>
                )}
              </p>
            </>
          )}
        </div>
        {selected.length > 0 && (
          <Link
            href={bookHref}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-amber text-green-deep text-[11px] font-bold uppercase tracking-widest"
          >
            <Send size={15} /> Wyślij zapytanie o termin
          </Link>
        )}
      </div>
    </section>
  );
}
