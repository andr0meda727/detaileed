'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getApiPublicStudios, type ServiceCategory, type VehicleSize } from '@detaileed/api-client';
import type { Bounds } from '@detaileed/ui/map/geo';
import { roundBounds } from '@detaileed/ui/map/geo';
import { toStudioPin } from '@/features/search/model/pins';

/** How many studios one search shows; more means "zoom in". */
export const PINS_PAGE_SIZE = 50;

/** Published studios inside the visible map area, for the chosen category and car size. */
export function useStudioPins(bounds: Bounds | null, filters: { category: ServiceCategory | null; size: VehicleSize }) {
  // Rounded outward, so tiny map moves reuse the cached answer (here and in the API's 60 s cache).
  const area = bounds && roundBounds(bounds);
  return useQuery({
    queryKey: ['/api/public/studios', area, filters],
    queryFn: async ({ signal }) => {
      const res = await getApiPublicStudios(
        {
          MinLat: area!.minLat,
          MaxLat: area!.maxLat,
          MinLng: area!.minLng,
          MaxLng: area!.maxLng,
          Category: filters.category ?? undefined,
          VehicleSize: filters.size,
          Page: 1,
          PageSize: PINS_PAGE_SIZE,
        },
        { signal },
      );
      return { pins: res.items.map(toStudioPin), totalCount: Number(res.totalCount ?? 0) };
    },
    enabled: area !== null,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
