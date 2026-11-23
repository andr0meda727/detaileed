import { MapPin, Phone, Star } from 'lucide-react';
import { Badge } from '@detaileed/ui';
import { serviceCategoryLabel } from '@detaileed/domain/serviceCategory';
import type { PublicListing } from '@detaileed/domain/listing';

/** Name, address, phone, rating and the kinds of work the studio does. */
export function StudioHeader({ listing }: { listing: PublicListing }) {
  return (
    <header className="flex flex-col gap-3 border-b border-border pb-7">
      <h1 className="text-4xl font-semibold tracking-tight text-foreground">{listing.name}</h1>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-4 shrink-0" strokeWidth={1.75} aria-hidden /> {listing.address}, {listing.city}
        </span>
        {listing.phone && (
          <a
            href={`tel:${listing.phone}`}
            className="flex items-center gap-1.5 rounded-sm transition-colors duration-150 hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Phone className="size-4 shrink-0" strokeWidth={1.75} aria-hidden /> {listing.phone}
          </a>
        )}
        <span className="flex items-center gap-1.5">
          {listing.averageRating === null ? (
            'Brak opinii'
          ) : (
            <>
              <Star className="size-4 shrink-0 fill-star text-star" strokeWidth={1.75} aria-hidden />
              <span className="font-medium text-foreground">{listing.averageRating.toFixed(1).replace('.', ',')}</span>(
              {listing.reviewCount} opinii)
            </>
          )}
        </span>
      </div>
      {listing.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {listing.categories.map((c) => (
            <Badge key={c} tone="neutral" dot={false}>
              {serviceCategoryLabel(c)}
            </Badge>
          ))}
        </div>
      )}
      {listing.description && (
        <p className="mt-1 max-w-3xl whitespace-pre-line leading-relaxed text-muted-foreground">
          {listing.description}
        </p>
      )}
    </header>
  );
}
