'use client';

import type { VehicleSize } from '@detaileed/api-client';
import { Checkbox } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { priceFor, servicesByCategory, type ListingService } from '@detaileed/domain/listing';
import { serviceCategoryLabel } from '@detaileed/domain/serviceCategory';

interface ServiceChecklistProps {
  services: ListingService[];
  size: VehicleSize;
  selected: string[];
  onChange: (ids: string[]) => void;
  /** Id of the error line under the list, linked from each checkbox. */
  errorId?: string;
}

/** The studio's services by category as checkboxes, each with its price for the car size. */
export function ServiceChecklist({ services, size, selected, onChange, errorId }: ServiceChecklistProps) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="flex flex-col gap-4">
      {servicesByCategory(services).map((group) => (
        <fieldset key={group.category}>
          <legend className="mb-2 text-xs font-medium text-faint">{serviceCategoryLabel(group.category)}</legend>
          <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
            {group.services.map((service) => {
              const price = priceFor(service, size);
              return (
                <li key={service.id}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-muted">
                    <Checkbox
                      checked={selected.includes(service.id)}
                      onCheckedChange={() => toggle(service.id)}
                      aria-describedby={errorId}
                    />
                    <span className="flex-1 text-sm font-medium text-foreground">{service.name}</span>
                    <span className="whitespace-nowrap font-mono text-sm tabular-nums text-muted-foreground">
                      {price === null ? 'na zapytanie' : `${formatPln(price)} zł`}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}
