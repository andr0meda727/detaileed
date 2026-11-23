'use client';

import type { VehicleSize } from '@detaileed/api-client';
import { Checkbox } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { priceFor, servicesByCategory, type ListingService } from '@detaileed/domain/listing';
import { serviceCategoryLabel } from '@detaileed/domain/serviceCategory';

interface OfferServicesProps {
  services: ListingService[];
  size: VehicleSize;
  selected: string[];
  onToggle: (id: string) => void;
}

/** The studio's services by category, each a checkbox row with its price for the car size. */
export function OfferServices({ services, size, selected, onToggle }: OfferServicesProps) {
  return servicesByCategory(services).map((group) => (
    <div key={group.category}>
      <h3 className="mb-2 text-xs font-medium text-faint">{serviceCategoryLabel(group.category)}</h3>
      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {group.services.map((service) => {
          const price = priceFor(service, size);
          return (
            <li key={service.id}>
              <label className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-muted">
                <Checkbox checked={selected.includes(service.id)} onCheckedChange={() => onToggle(service.id)} />
                <span className="flex-1 text-sm font-medium text-foreground">{service.name}</span>
                <span className="whitespace-nowrap font-mono text-sm tabular-nums text-muted-foreground">
                  {price === null ? 'na zapytanie' : `${formatPln(price)} zł`}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  ));
}
