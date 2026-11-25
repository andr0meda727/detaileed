import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Badge, StarRating, cn } from '@detaileed/ui';
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
export function StudioCard({ pin, size, selected, onHover }: StudioCardProps) {
  return (
    <Link
      href={`/studio/${pin.studioId}?size=${size}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={cn(
        'block rounded-lg border border-border bg-surface p-4 transition-colors duration-150 hover:bg-muted',
        'outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'focus-visible:ring-offset-background',
        selected && 'border-primary ring-1 ring-primary',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{pin.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden /> {pin.city}
          </p>
        </div>
        <p className="whitespace-nowrap font-mono text-sm tabular-nums text-foreground">
          {pin.fromPrice === null ? 'Wycena' : `od ${formatPln(pin.fromPrice)} zł`}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        {pin.averageRating === null ? (
          'Brak opinii'
        ) : (
          <>
            <StarRating value={pin.averageRating} size={14} />
            <span>
              <span className="font-medium text-foreground">{pin.averageRating.toFixed(1).replace('.', ',')}</span> (
              {pin.reviewCount})
            </span>
          </>
        )}
      </div>
      {pin.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pin.categories.map((c) => (
            <Badge key={c} tone="neutral" size="sm" dot={false}>
              {serviceCategoryLabel(c)}
            </Badge>
          ))}
        </div>
      )}
    </Link>
  );
}
