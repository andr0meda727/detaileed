import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Badge, StarRating } from '@detaileed/ui';
import { formatPln } from '@detaileed/domain/money';
import { serviceCategoryLabel } from '@detaileed/domain/serviceCategory';
import type { VehicleSize } from '@detaileed/api-client';
import type { StudioPin } from '@/features/search/model/pins';

interface StudioCardProps {
  pin: StudioPin;
  size: VehicleSize;
  selected: boolean;
  onHover?: () => void;
}

/** A studio in the search results; links to its page with the chosen car size. */
export default function StudioCard({ pin, size, selected, onHover }: StudioCardProps) {
  return (
    <Link
      href={`/studio/${pin.studioId}?rozmiar=${size}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={`block floating-card p-4 ${selected ? 'ring-2 ring-amber' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-green-deep truncate">{pin.name}</p>
          <p className="text-xs text-green-light flex items-center gap-1 mt-0.5">
            <MapPin size={12} /> {pin.city}
          </p>
        </div>
        <p className="text-sm font-bold text-green-deep whitespace-nowrap">
          {pin.fromPrice === null ? 'Wycena' : `od ${formatPln(pin.fromPrice)} zł`}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-green-light">
        {pin.averageRating === null ? (
          'Brak opinii'
        ) : (
          <>
            <StarRating value={pin.averageRating} size={13} />
            <span>
              {pin.averageRating.toFixed(1).replace('.', ',')} ({pin.reviewCount})
            </span>
          </>
        )}
      </div>
      {pin.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pin.categories.map((c) => (
            <Badge key={c} tone="brand" size="sm">
              {serviceCategoryLabel(c)}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
