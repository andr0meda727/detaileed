import { ServiceCategory, VehicleSize } from '@detaileed/api-client';
import type { Service, ServiceInput } from '@/features/services/model/types';
import type { ServiceFormValues } from '@/features/services/model/schemas';

const SIZES = Object.values(VehicleSize);

const priceText = (n: number | undefined) => (n === undefined ? '' : String(n).replace('.', ','));

/** Form values for a new service (Other, 60 minutes, no prices) or an existing one. */
export function serviceFormDefaults(service: Service | null): ServiceFormValues {
  const priceOf = (size: VehicleSize) => service?.prices.find((p) => p.vehicleSize === size)?.price;
  return {
    name: service?.name ?? '',
    category: service?.category ?? ServiceCategory.Other,
    durationMinutes: String(service?.durationMinutes ?? 60),
    prices: {
      Small: priceText(priceOf(VehicleSize.Small)),
      Medium: priceText(priceOf(VehicleSize.Medium)),
      Large: priceText(priceOf(VehicleSize.Large)),
      XL: priceText(priceOf(VehicleSize.XL)),
    },
  };
}

/**
 * Body of `POST/PUT /api/Service`. Every field is sent, so on edit the prices list replaces the old one and an
 * emptied price becomes "price on request".
 */
export function toServiceInput(values: ServiceFormValues): ServiceInput {
  return {
    name: values.name.trim(),
    category: values.category,
    durationMinutes: Number(values.durationMinutes),
    prices: SIZES.filter((size) => values.prices[size].trim() !== '').map((size) => ({
      vehicleSize: size,
      price: Number(values.prices[size].trim().replace(',', '.')),
    })),
  };
}
