import { describe, expect, it } from 'vitest';
import type { ListingDto } from '@detaileed/api-client';
import { toListing } from '@/features/marketplace/model/types';
import { listingFormSchema } from '@/features/marketplace/model/schemas';
import { listingFormDefaults, toListingInput } from '@/features/marketplace/model/listingForm';

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
  it('prefills a new profile from the studio', () => {
    expect(listingFormDefaults(null, { name: 'Detail Kraków', address: 'ul. Długa 1' })).toEqual({
      name: 'Detail Kraków',
      description: '',
      address: 'ul. Długa 1',
      city: '',
      phone: '',
      location: null,
    });
  });

  it('requires a pin and a valid phone', () => {
    const values = listingFormDefaults(toListing(dto), { name: '' });
    expect(listingFormSchema.safeParse(values).success).toBe(true);

    const noPin = listingFormSchema.safeParse({ ...values, location: null });
    expect(noPin.success).toBe(false);
    expect(noPin.error?.issues[0].message).toBe('Zaznacz studio na mapie');

    expect(listingFormSchema.safeParse({ ...values, phone: '123' }).success).toBe(false);
    expect(listingFormSchema.safeParse({ ...values, phone: '+48 500 600 700' }).success).toBe(true);
  });

  it('builds the request, with empty optional fields as null', () => {
    const values = { ...listingFormDefaults(toListing(dto), { name: '' }), description: '  ', phone: '' };
    expect(toListingInput(listingFormSchema.parse(values))).toEqual({
      name: 'Detail Kraków',
      description: null,
      address: 'ul. Długa 1',
      city: 'Kraków',
      phone: null,
      latitude: 50.06,
      longitude: 19.94,
    });
  });
});
