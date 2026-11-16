import type { ListingDto, ListingRequest, ServiceCategory, VehicleSize } from '@detaileed/api-client';

/** The studio's public profile with numbers as numbers (the API may send them as strings). */
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
  timeZone: string;
  categories: ServiceCategory[];
  services: {
    id: string;
    name: string;
    category: ServiceCategory;
    prices: { vehicleSize: VehicleSize; price: number }[];
  }[];
  /** One decimal; null before the first review. */
  averageRating: number | null;
  reviewCount: number;
}

/** Body of `PUT /api/marketplace/listing`. */
export type ListingInput = ListingRequest;

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
    timeZone: dto.timeZone,
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
