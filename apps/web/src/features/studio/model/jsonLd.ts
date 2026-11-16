import type { Listing } from '@detaileed/domain/listing';

/** schema.org data for a studio page (a local business that details cars), for search engines. */
export function studioJsonLd(listing: Listing, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoWash',
    '@id': url,
    url,
    name: listing.name,
    ...(listing.description ? { description: listing.description } : {}),
    ...(listing.phone ? { telephone: listing.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: listing.city,
      addressCountry: 'PL',
    },
    geo: { '@type': 'GeoCoordinates', latitude: listing.latitude, longitude: listing.longitude },
    ...(listing.averageRating !== null && listing.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: listing.averageRating,
            reviewCount: listing.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}
