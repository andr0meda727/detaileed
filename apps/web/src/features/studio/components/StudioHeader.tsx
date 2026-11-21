import { MapPin, Phone } from 'lucide-react';
import { Badge, StarRating } from '@detaileed/ui';
import { serviceCategoryLabel } from '@detaileed/domain/serviceCategory';
import type { PublicListing } from '@detaileed/domain/listing';

/** Name, address, phone, rating and the kinds of work the studio does. */
export function StudioHeader({ listing }: { listing: PublicListing }) {
  return (
    <header className="space-y-3">
      <h1 className="font-serif text-4xl sm:text-5xl tracking-tight">{listing.name}</h1>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-green-light">
        <span className="flex items-center gap-1.5">
          <MapPin size={15} /> {listing.address}, {listing.city}
        </span>
        {listing.phone && (
          <a href={`tel:${listing.phone}`} className="flex items-center gap-1.5 hover:text-green-deep">
            <Phone size={15} /> {listing.phone}
          </a>
        )}
        <span className="flex items-center gap-1.5">
          {listing.averageRating === null ? (
            'Brak opinii'
          ) : (
            <>
              <StarRating value={listing.averageRating} size={15} />
              {listing.averageRating.toFixed(1).replace('.', ',')} ({listing.reviewCount} opinii)
            </>
          )}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {listing.categories.map((c) => (
          <Badge key={c} tone="brand" size="sm">
            {serviceCategoryLabel(c)}
          </Badge>
        ))}
      </div>
      {listing.description && <p className="max-w-3xl text-green-deep/80 whitespace-pre-line">{listing.description}</p>}
    </header>
  );
}
