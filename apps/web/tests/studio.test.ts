import { describe, expect, it } from 'vitest';
import type { Listing } from '@detaileed/domain/listing';
import { studioJsonLd } from '@/features/studio/model/jsonLd';
import { toReviewPage } from '@/features/studio/model/reviews';

const listing: Listing = {
  studioId: 's1',
  name: 'Detail Kraków',
  description: null,
  address: 'ul. Długa 1',
  city: 'Kraków',
  phone: '500600700',
  latitude: 50.06,
  longitude: 19.94,
  isPublished: true,
  timeZone: 'Europe/Warsaw',
  categories: [],
  services: [],
  averageRating: 4.7,
  reviewCount: 12,
};

describe('studioJsonLd', () => {
  it('describes the studio with its address, position and rating', () => {
    const ld = studioJsonLd(listing, 'https://detaileed.com/studio/s1');
    expect(ld).toMatchObject({
      '@type': 'AutoWash',
      name: 'Detail Kraków',
      telephone: '500600700',
      address: { addressLocality: 'Kraków', streetAddress: 'ul. Długa 1' },
      geo: { latitude: 50.06, longitude: 19.94 },
      aggregateRating: { ratingValue: 4.7, reviewCount: 12 },
    });
    expect(ld).not.toHaveProperty('description');
  });

  it('leaves the rating out before the first review', () => {
    expect(studioJsonLd({ ...listing, averageRating: null, reviewCount: 0 }, 'x')).not.toHaveProperty(
      'aggregateRating',
    );
  });
});

describe('toReviewPage', () => {
  it('turns ratings into numbers and keeps the cursor', () => {
    const page = toReviewPage({
      items: [{ id: 'r', authorName: 'Anna N.', rating: '5', comment: null, createdAt: '2026-11-10T10:00:00Z' }],
      nextCursor: 'abc',
    });
    expect(page.items[0].rating).toBe(5);
    expect(page.nextCursor).toBe('abc');
  });
});
