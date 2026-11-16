import type { ListingDto, ServiceCategory, VehicleSize } from '@detaileed/api-client';
import { SERVICE_CATEGORIES } from './serviceCategory';

/** A service on a studio's public profile, with its prices per vehicle size (a missing size = price on request). */
export interface ListingService {
  id: string;
  name: string;
  category: ServiceCategory;
  prices: { vehicleSize: VehicleSize; price: number }[];
}

/** A studio's public profile with numbers as numbers (the API may send them as strings). */
export interface Listing {
  studioId: string;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  isPublished: boolean;
  /** The studio's IANA zone, in which its times are meant. */
  timeZone: string;
  categories: ServiceCategory[];
  services: ListingService[];
  /** One decimal; null before the first review. */
  averageRating: number | null;
  reviewCount: number;
}

export function toListing(dto: ListingDto): Listing {
  return {
    studioId: dto.studioId,
    name: dto.name,
    description: dto.description,
    address: dto.address,
    city: dto.city,
    phone: dto.phone,
    latitude: Number(dto.latitude),
    longitude: Number(dto.longitude),
    isPublished: dto.isPublished,
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
