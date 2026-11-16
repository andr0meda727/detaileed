import type { ServiceCategory, StudioPinDto } from '@detaileed/api-client';
import { formatPln } from '@detaileed/domain/money';

/** A published studio on the map, with numbers as numbers. */
export interface StudioPin {
  studioId: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  categories: ServiceCategory[];
  /** Cheapest price for the chosen size (and category); null = price on request. */
  fromPrice: number | null;
  averageRating: number | null;
  reviewCount: number;
}

export function toStudioPin(dto: StudioPinDto): StudioPin {
  return {
    studioId: dto.studioId,
    name: dto.name,
    city: dto.city,
    lat: Number(dto.latitude),
    lng: Number(dto.longitude),
    categories: dto.categories,
    fromPrice: dto.fromPrice == null ? null : Number(dto.fromPrice),
    averageRating: dto.averageRating == null ? null : Number(dto.averageRating),
    reviewCount: Number(dto.reviewCount ?? 0),
  };
}

/** The pin's label on the map: "od 89 zł", or "?" when the price is on request. */
export function pinLabel(pin: StudioPin): string {
  return pin.fromPrice === null ? '?' : `od ${formatPln(pin.fromPrice).replace(/,00$/, '')} zł`;
}
