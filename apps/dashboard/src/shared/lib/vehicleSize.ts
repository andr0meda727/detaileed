import { VehicleSize } from '@detaileed/api-client';

/** Vehicle sizes in order, with Polish labels. Prices and visit lengths depend on the size. */
export const VEHICLE_SIZES: { value: VehicleSize; label: string; short: string }[] = [
  { value: VehicleSize.Small, label: 'Małe (miejskie)', short: 'Małe' },
  { value: VehicleSize.Medium, label: 'Średnie (kompakt, sedan)', short: 'Średnie' },
  { value: VehicleSize.Large, label: 'Duże (SUV, kombi)', short: 'Duże' },
  { value: VehicleSize.XL, label: 'XL (van, pickup)', short: 'XL' },
];

/** The default size for a new vehicle (the API uses it when none is sent). */
export const DEFAULT_VEHICLE_SIZE: VehicleSize = VehicleSize.Medium;

/** Short Polish label of a size ("Duże"), or an empty string when unknown. */
export function vehicleSizeLabel(size: string | null | undefined): string {
  return VEHICLE_SIZES.find((s) => s.value === size)?.short ?? '';
}

/** `Select` options for a size field. */
export const VEHICLE_SIZE_OPTIONS = VEHICLE_SIZES.map((s) => ({ value: s.value, label: s.label }));
