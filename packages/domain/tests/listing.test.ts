import { describe, expect, it } from 'vitest';
import { priceFor, servicesByCategory, toListing } from '../src/listing';

const dto = {
  studioId: 's1',
  name: 'Detail Kraków',
  description: null,
  address: 'ul. Długa 1',
  city: 'Kraków',
  phone: null,
  latitude: '50.06',
  longitude: 19.94,
  isPublished: true,
  timeZone: '',
  categories: ['Interior' as const, 'ExteriorWash' as const],
  services: [
    {
      id: 'b',
      name: 'Pranie',
      category: 'Interior' as const,
      prices: [{ vehicleSize: 'Large' as const, price: '349.99' }],
    },
    { id: 'a', name: 'Mycie', category: 'ExteriorWash' as const, prices: [] },
    { id: 'c', name: 'Odkurzanie', category: 'Interior' as const, prices: [] },
  ],
  averageRating: null,
  reviewCount: 0,
};

describe('listing helpers', () => {
  it('normalises numbers and defaults the time zone', () => {
    const listing = toListing(dto);
    expect(listing.latitude).toBe(50.06);
    expect(listing.timeZone).toBe('Europe/Warsaw');
    expect(listing.services[0].prices[0].price).toBe(349.99);
  });

  it('gives the price for a size, or null for "on request"', () => {
    const [pranie] = toListing(dto).services;
    expect(priceFor(pranie, 'Large')).toBe(349.99);
    expect(priceFor(pranie, 'Small')).toBeNull();
  });

  it('groups services by category in display order, names sorted', () => {
    const groups = servicesByCategory(toListing(dto).services);
    expect(groups.map((g) => [g.category, g.services.map((s) => s.name)])).toEqual([
      ['ExteriorWash', ['Mycie']],
      ['Interior', ['Odkurzanie', 'Pranie']],
    ]);
  });
});
