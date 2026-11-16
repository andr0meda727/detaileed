import type { ServiceCategory, ServiceRequest, ServiceResponseDto, VehicleSize } from '@detaileed/api-client';

/** An active service of the studio with numbers as numbers (the API may send them as strings). */
export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  /** Prices per vehicle size in złoty; a size missing here is "price on request". */
  prices: { vehicleSize: VehicleSize; price: number }[];
  /** How long it takes on a Medium car. */
  durationMinutes: number;
}

/** Body of `POST/PUT /api/Service`; left-out category, prices and duration are kept on update. */
export type ServiceInput = ServiceRequest;

export function toService(dto: ServiceResponseDto): Service {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    prices: dto.prices.map((p) => ({ vehicleSize: p.vehicleSize, price: Number(p.price) })),
    durationMinutes: Number(dto.durationMinutes),
  };
}

/** The lowest price of a service, or null when every size is "price on request". */
export function fromPrice(service: Pick<Service, 'prices'>): number | null {
  return service.prices.length ? Math.min(...service.prices.map((p) => p.price)) : null;
}
