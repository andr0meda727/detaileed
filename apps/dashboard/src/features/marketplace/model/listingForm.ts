import type { Listing, ListingInput } from '@/features/marketplace/model/types';
import type { ListingFormInput, ListingFormValues } from '@/features/marketplace/model/schemas';

/** Form values for the profile: the saved listing, or a new one prefilled with the studio's name and address. */
export function listingFormDefaults(
  listing: Listing | null,
  studio: { name: string; address?: string | null },
): ListingFormInput {
  if (!listing) {
    return {
      name: studio.name,
      description: '',
      address: studio.address ?? '',
      city: '',
      phone: '',
      location: null,
    };
  }
  return {
    name: listing.name,
    description: listing.description ?? '',
    address: listing.address,
    city: listing.city,
    phone: listing.phone ?? '',
    location: { lat: listing.latitude, lng: listing.longitude },
  };
}

/** Body of `PUT /api/marketplace/listing` from validated form values. */
export function toListingInput(values: ListingFormValues): ListingInput {
  return {
    name: values.name.trim(),
    description: values.description.trim() || null,
    address: values.address.trim(),
    city: values.city.trim(),
    phone: values.phone.trim() || null,
    latitude: values.location.lat,
    longitude: values.location.lng,
  };
}
