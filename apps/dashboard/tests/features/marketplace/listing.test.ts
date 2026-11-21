import { describe, expect, it } from 'vitest';
import type { ListingDto } from '@detaileed/api-client';
import { toListing } from '@/features/marketplace/model/types';
import { listingFormSchema } from '@/features/marketplace/model/schemas';
import { listingAddress, listingFormDefaults, toListingInput } from '@/features/marketplace/model/listingForm';

const dto: ListingDto = {
  studioId: 's1',
  name: 'Detail Kraków',
  description: null,
  address: 'ul. Długa 1',
  city: 'Kraków',
  phone: null,
  latitude: '50.06',
  longitude: 19.94,
  isPublished: false,
  hasCompleteDetails: true,
  timeZone: 'Europe/Warsaw',
  categories: ['Interior'],
  services: [{ id: 'x', name: 'Pranie', category: 'Interior', prices: [{ vehicleSize: 'Large', price: '349.99' }] }],
  averageRating: '4.7',
  reviewCount: '12',
};

describe('toListing', () => {
  it('turns the numbers into numbers', () => {
    const listing = toListing(dto);
    expect(listing.latitude).toBe(50.06);
    expect(listing.averageRating).toBe(4.7);
    expect(listing.reviewCount).toBe(12);
    expect(listing.services[0].prices[0].price).toBe(349.99);
  });

  it('keeps a missing rating as null', () => {
    expect(toListing({ ...dto, averageRating: null, reviewCount: 0 }).averageRating).toBeNull();
  });
});

describe('listing form', () => {
  it('starts a new profile with an empty description', () => {
    expect(listingFormDefaults(null)).toEqual({ description: '' });
  });

  it('limits the description', () => {
    expect(listingFormSchema.safeParse({ description: 'x'.repeat(2000) }).success).toBe(true);
    expect(listingFormSchema.safeParse({ description: 'x'.repeat(2001) }).success).toBe(false);
  });

  it('sends only the description, an empty one as null', () => {
    expect(toListingInput(listingFormSchema.parse({ description: '  ' }))).toEqual({ description: null });
    expect(toListingInput(listingFormSchema.parse({ description: ' Ceramika ' }))).toEqual({
      description: 'Ceramika',
    });
  });

  it('joins the address and city, leaving out what is missing', () => {
    expect(listingAddress({ address: 'ul. Długa 1', city: 'Kraków' })).toBe('ul. Długa 1, Kraków');
    expect(listingAddress({ address: null, city: 'Kraków' })).toBe('Kraków');
    expect(listingAddress({ address: null, city: null })).toBeNull();
  });
});
