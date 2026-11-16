import { ServiceCategory } from '@detaileed/api-client';

/** Service categories in display order, with Polish labels (the API sends the names). */
export const SERVICE_CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: ServiceCategory.ExteriorWash, label: 'Mycie zewnętrzne' },
  { value: ServiceCategory.Interior, label: 'Wnętrze' },
  { value: ServiceCategory.Polishing, label: 'Polerowanie' },
  { value: ServiceCategory.Ceramic, label: 'Powłoki ceramiczne' },
  { value: ServiceCategory.Ppf, label: 'Folia ochronna (PPF)' },
  { value: ServiceCategory.WheelsAndTyres, label: 'Koła i opony' },
  { value: ServiceCategory.Other, label: 'Inne' },
];

/** Polish label of a category ("Wnętrze"); unknown values are shown as they come. */
export function serviceCategoryLabel(category: string | null | undefined): string {
  return SERVICE_CATEGORIES.find((c) => c.value === category)?.label ?? category ?? '';
}
