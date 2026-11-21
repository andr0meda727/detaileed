import { describe, expect, it } from 'vitest';
import { DEFAULT_SEARCH, parseSearch, serializeSearch } from '@/features/search/model/searchState';
import { pinLabel, toStudioPin } from '@/features/search/model/pins';

describe('search state in the URL', () => {
  it('defaults to Poland, all categories and a Medium car', () => {
    expect(parseSearch({})).toEqual(DEFAULT_SEARCH);
    expect(serializeSearch(DEFAULT_SEARCH)).toBe('');
  });

  it('round-trips a position and filters', () => {
    const state = { lat: 50.0614, lng: 19.9366, zoom: 12, category: 'Interior' as const, size: 'Large' as const };
    const query = serializeSearch(state);
    expect(query).toBe('lat=50.0614&lng=19.9366&z=12.0&category=Interior&size=Large');
    expect(parseSearch(Object.fromEntries(new URLSearchParams(query)))).toEqual(state);
  });

  it('ignores invalid values', () => {
    expect(parseSearch({ lat: '999', z: 'abc', category: 'Pizza', size: 'Huge' })).toEqual(DEFAULT_SEARCH);
  });
});

describe('studio pins', () => {
  const dto = {
    studioId: 's1',
    name: 'Detail Kraków',
    city: 'Kraków',
    latitude: '50.06',
    longitude: 19.94,
    categories: ['Interior' as const],
    fromPrice: '89.00',
    averageRating: '4.7',
    reviewCount: '12',
  };

  it('normalises numbers', () => {
    expect(toStudioPin(dto)).toMatchObject({ lat: 50.06, fromPrice: 89, averageRating: 4.7, reviewCount: 12 });
  });

  it('labels the pin with the from price', () => {
    expect(pinLabel(toStudioPin(dto))).toBe('od 89 zł');
    expect(pinLabel(toStudioPin({ ...dto, fromPrice: '89.5' }))).toBe('od 89,50 zł');
    expect(pinLabel(toStudioPin({ ...dto, fromPrice: null }))).toBe('?');
  });
});
