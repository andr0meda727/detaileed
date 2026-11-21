import type { ListingDto, ServiceCategory, VehicleSize } from '@detaileed/api-client';
import { SERVICE_CATEGORIES } from './serviceCategory';

/** A service on a studio's public profile, with its prices per vehicle size (a missing size = price on request). */
export interface ListingService {
  id: string;
  name: string;
  category: ServiceCategory;
  prices: { vehicleSize: VehicleSize; price: number }[];
}

/**
 * A studio's public profile with numbers as numbers (the API may send them as strings). The name, phone, address,
 * city and pin are a copy of the studio's details (edited in the studio settings); the location fields are null
 * until the owner fills them in.
 */
export interface Listing {
  studioId: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  isPublished: boolean;
  /** Address, city and pin are all set; a listing can only be published then. */
  hasCompleteDetails: boolean;
  /** The studio's IANA zone, in which its times are meant. */
  timeZone: string;
  categories: ServiceCategory[];
  services: ListingService[];
  /** One decimal; null before the first review. */
  averageRating: number | null;
  reviewCount: number;
}

/** A listing customers can see: it is placed on the map, so its address, city and pin are set. */
export type PublicListing = Listing & { address: string; city: string; latitude: number; longitude: number };

export function toListing(dto: ListingDto): Listing {
  return {
    studioId: dto.studioId,
    name: dto.name,
    description: dto.description,
    address: dto.address,
    city: dto.city,
    phone: dto.phone,
    latitude: dto.latitude == null ? null : Number(dto.latitude),
    longitude: dto.longitude == null ? null : Number(dto.longitude),
    isPublished: dto.isPublished,
    hasCompleteDetails: dto.hasCompleteDetails,
    timeZone: dto.timeZone || 'Europe/Warsaw',
    categories: dto.categories,
    services: dto.services.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      prices: s.prices.map((p) => ({ vehicleSize: p.vehicleSize, price: Number(p.price) })),
    })),
    averageRating: dto.averageRating == null ? null : Number(dto.averageRating),
    reviewCount: Number(dto.reviewCount ?? 0),
  };
}

/** Whether the listing is placed on the map (address, city and pin set), as every published one is. */
export function isPlaced(listing: Listing): listing is PublicListing {
  return listing.address !== null && listing.city !== null && listing.latitude !== null && listing.longitude !== null;
}

/** A public studio page's listing, or null when it can't be shown on the map (never so for a published one). */
export function toPublicListing(dto: ListingDto): PublicListing | null {
  const listing = toListing(dto);
  return isPlaced(listing) ? listing : null;
}

/** The service's price for a car size, or null when it is "price on request". */
export function priceFor(service: Pick<ListingService, 'prices'>, size: VehicleSize): number | null {
  return service.prices.find((p) => p.vehicleSize === size)?.price ?? null;
}

/** Services grouped by category, in the categories' display order; empty categories are left out. */
export function servicesByCategory<T extends Pick<ListingService, 'category' | 'name'>>(
  services: T[],
): { category: ServiceCategory; services: T[] }[] {
  return SERVICE_CATEGORIES.map((c) => ({
    category: c.value,
    services: services.filter((s) => s.category === c.value).sort((a, b) => a.name.localeCompare(b.name, 'pl')),
  })).filter((g) => g.services.length > 0);
}
