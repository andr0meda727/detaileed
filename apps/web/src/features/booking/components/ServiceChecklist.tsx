'use client';

import { Check } from 'lucide-react';
import type { VehicleSize } from '@detaileed/api-client';
import { formatPln } from '@detaileed/domain/money';
import { priceFor, servicesByCategory, type ListingService } from '@detaileed/domain/listing';
import { serviceCategoryLabel } from '@detaileed/domain/serviceCategory';

interface ServiceChecklistProps {
  services: ListingService[];
  size: VehicleSize;
  selected: string[];
  onChange: (ids: string[]) => void;
}

/** The studio's services by category as checkboxes, each with its price for the car size. */
export default function ServiceChecklist({ services, size, selected, onChange }: ServiceChecklistProps) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="space-y-4">
      {servicesByCategory(services).map((group) => (
        <fieldset key={group.category}>
          <legend className="text-[11px] font-bold uppercase tracking-widest text-green-light mb-1.5">
            {serviceCategoryLabel(group.category)}
          </legend>
          <ul className="divide-y divide-green-deep/5 rounded-xl border border-green-deep/5">
            {group.services.map((service) => {
              const price = priceFor(service, size);
              const isSelected = selected.includes(service.id);
              return (
                <li key={service.id}>
                  <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-cream/50">
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
                    <span className="flex-1 font-semibold text-sm">{service.name}</span>
                    <span className="text-sm text-green-light whitespace-nowrap">
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
