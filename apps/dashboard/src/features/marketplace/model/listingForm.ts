import type { Listing, ListingInput } from '@/features/marketplace/model/types';
import type { ListingFormInput, ListingFormValues } from '@/features/marketplace/model/schemas';

/** Form values for the profile: the saved listing's description, or an empty one for a new profile. */
export function listingFormDefaults(listing: Listing | null): ListingFormInput {
  return { description: listing?.description ?? '' };
}

/** Body of `PUT /api/marketplace/listing` from validated form values. */
export function toListingInput(values: ListingFormValues): ListingInput {
  return { description: values.description || null };
}

/** The profile's address as one line, or null while the studio has none. */
export function listingAddress(listing: Pick<Listing, 'address' | 'city'>): string | null {
  const parts = [listing.address, listing.city].filter((p): p is string => !!p);
  return parts.length ? parts.join(', ') : null;
}
