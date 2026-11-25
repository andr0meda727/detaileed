import type {
  CursorResponseOfReviewDto,
  EstimateDto,
  EstimateRequest,
  ListingDto,
  ListingRequest,
  PublicAvailabilityDto,
  ReviewDto,
  ServiceCategory,
  StudioPinDto,
  VehicleSize,
} from '@detaileed/api-client';
import { empty, problem, validationProblem } from '../http.ts';
import { route, type MockRequest, type Route } from '../router.ts';
import { requireOwner, requireStudio } from '../store/context.ts';
import { paged } from '../store/paging.ts';
import { planningEnabled, priceFor } from '../store/planning.ts';
import { db } from '../store/store.ts';
import type { Review, Studio } from '../store/types.ts';
import { readAvailabilityQuery } from './planning.ts';
import { servicesOf } from './services.ts';

export const hasCompleteDetails = (s: Studio) =>
  Boolean(s.address && s.city && s.latitude !== null && s.longitude !== null);

const reviewsOf = (studioId: string) =>
  db()
    .reviews.filter((r) => r.studioId === studioId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

function rating(studioId: string) {
  const reviews = reviewsOf(studioId);
  const average = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;
  return { averageRating: average === null ? null : Math.round(average * 10) / 10, reviewCount: reviews.length };
}

/** The public profile: the studio's details and price list, the owner's description, the rating. */
export function toListingDto(studio: Studio) {
  const listing = db().listings.find((l) => l.studioId === studio.id);
  const services = servicesOf(studio.id);
  return {
    studioId: studio.id,
    name: studio.name,
    description: listing?.description ?? null,
    address: studio.address,
    city: studio.city,
    phone: studio.phone,
    latitude: studio.latitude,
    longitude: studio.longitude,
    isPublished: listing?.isPublished ?? false,
    hasCompleteDetails: hasCompleteDetails(studio),
    timeZone: studio.timeZone,
    categories: [...new Set(services.map((s) => s.category))],
    services: services.map((s) => ({ id: s.id, name: s.name, category: s.category, prices: s.prices })),
    ...rating(studio.id),
  } satisfies ListingDto;
}

function findListing(studioId: string) {
  const listing = db().listings.find((l) => l.studioId === studioId);
  if (!listing) throw problem(404, 'LISTING_NOT_FOUND', 'Studio nie ma jeszcze profilu publicznego.');
  return listing;
}

/** A published studio the customer site may show; unpublished and unknown ones are 404 alike. */
export function publishedStudio(studioId: string): Studio {
  const studio = db().studios.find((s) => s.id === studioId);
  const listing = db().listings.find((l) => l.studioId === studioId);
  if (!studio || !listing?.isPublished || !hasCompleteDetails(studio)) {
    throw problem(404, 'STUDIO_NOT_FOUND', 'Nie znaleziono studia.');
  }
  return studio;
}

const toReviewDto = (r: Review) =>
  ({
    id: r.id,
    authorName: r.authorName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
  }) satisfies ReviewDto;

function pins(req: MockRequest) {
  const q = req.query;
  const bound = (name: string) => (q.get(name) === null || q.get(name) === '' ? null : Number(q.get(name)));
  const [minLat, maxLat, minLng, maxLng] = ['MinLat', 'MaxLat', 'MinLng', 'MaxLng'].map(bound);
  const category = (q.get('Category') || null) as ServiceCategory | null;
  const size = (q.get('VehicleSize') || 'Medium') as VehicleSize;
  const items = db()
    .studios.filter((s) => db().listings.some((l) => l.studioId === s.id && l.isPublished) && hasCompleteDetails(s))
    .filter(
      (s) =>
        (minLat === null || s.latitude! >= minLat) &&
        (maxLat === null || s.latitude! <= maxLat) &&
        (minLng === null || s.longitude! >= minLng) &&
        (maxLng === null || s.longitude! <= maxLng),
    )
    .flatMap((s) => {
      const services = servicesOf(s.id);
      const offered = services.filter((x) => !category || x.category === category);
      if (offered.length === 0) return [];
      const prices = offered.flatMap((x) => x.prices.filter((p) => p.vehicleSize === size).map((p) => p.price));
      return [
        {
          studioId: s.id,
          name: s.name,
          city: s.city!,
          latitude: s.latitude!,
          longitude: s.longitude!,
          categories: [...new Set(services.map((x) => x.category))],
          fromPrice: prices.length ? Math.min(...prices) : null,
          ...rating(s.id),
        } satisfies StudioPinDto,
      ];
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  return paged(items, q);
}

function reviews(req: MockRequest): CursorResponseOfReviewDto {
  const studio = publishedStudio(req.params.studioId);
  const limit = Number(req.query.get('Limit') ?? 10);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw validationProblem({ Limit: ['Od 1 do 100.'] });
  const all = reviewsOf(studio.id);
  const cursor = req.query.get('Cursor');
  const start = cursor ? Math.max(0, all.findIndex((r) => r.id === cursor) + 1) : 0;
  const items = all.slice(start, start + limit);
  return {
    items: items.map(toReviewDto),
    nextCursor: start + limit < all.length ? items[items.length - 1].id : null,
  };
}

export const marketplaceRoutes: Route[] = [
  route('GET', '/api/marketplace/listing', (req) => {
    const { studio } = requireStudio(req);
    findListing(studio.id);
    return toListingDto(studio);
  }),

  route('PUT', '/api/marketplace/listing', (req) => {
    const { studio } = requireOwner(req);
    const body = (req.body ?? {}) as ListingRequest;
    const description = body.description?.trim() || null;
    if (description && description.length > 2000) {
      throw validationProblem({ Description: ['Opis może mieć najwyżej 2000 znaków.'] });
    }
    const listing = db().listings.find((l) => l.studioId === studio.id);
    if (listing) listing.description = description;
    else db().listings.push({ studioId: studio.id, description, isPublished: false });
    return toListingDto(studio);
  }),

  route('POST', '/api/marketplace/listing/publish', (req) => {
    const { studio } = requireOwner(req);
    const listing = findListing(studio.id);
    if (!hasCompleteDetails(studio)) {
      throw problem(
        409,
        'LISTING_INCOMPLETE',
        'Uzupełnij adres, miasto i pinezkę na mapie, zanim opublikujesz profil.',
      );
    }
    if (servicesOf(studio.id).length === 0) {
      throw problem(409, 'LISTING_HAS_NO_SERVICES', 'Dodaj co najmniej jedną usługę, zanim opublikujesz profil.');
    }
    listing.isPublished = true;
    return empty();
  }),

  route('POST', '/api/marketplace/listing/unpublish', (req) => {
    const { studio } = requireOwner(req);
    findListing(studio.id).isPublished = false;
    return empty();
  }),

  route('GET', '/api/public/studios', pins),

  route('GET', '/api/public/studios/{studioId}', (req) => toListingDto(publishedStudio(req.params.studioId))),

  route('GET', '/api/public/studios/{studioId}/reviews', reviews),

  route('GET', '/api/public/studios/{studioId}/availability', (req) => {
    const studio = publishedStudio(req.params.studioId);
    const { durationMinutes, slots } = readAvailabilityQuery(studio, req.query);
    return {
      planningEnabled: planningEnabled(studio.id),
      durationMinutes,
      timeZone: studio.timeZone,
      slots: slots.map((s) => ({ start: s.start, end: s.end })),
    } satisfies PublicAvailabilityDto;
  }),

  route('POST', '/api/public/studios/{studioId}/estimate', (req) => {
    const studio = publishedStudio(req.params.studioId);
    const body = (req.body ?? {}) as EstimateRequest;
    const ids = (body.serviceIds ?? []).filter((id) => servicesOf(studio.id).some((s) => s.id === id));
    const { lines, total, hasUnpriced } = priceFor(ids, body.vehicleSize ?? 'Medium');
    return { services: lines, total, hasUnpricedServices: hasUnpriced } satisfies EstimateDto;
  }),
];
