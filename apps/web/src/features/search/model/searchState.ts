import { ServiceCategory, VehicleSize } from '@detaileed/api-client';
import { POLAND_VIEW } from '@detaileed/ui/map/geo';

/** What the home page search shows: the map position and the filters. Kept in the URL so it can be shared. */
export interface SearchState {
  lat: number;
  lng: number;
  zoom: number;
  category: ServiceCategory | null;
  size: VehicleSize;
}

export const DEFAULT_SEARCH: SearchState = {
  lat: POLAND_VIEW.lat,
  lng: POLAND_VIEW.lng,
  zoom: POLAND_VIEW.zoom,
  category: null,
  size: VehicleSize.Medium,
};

type Params = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function num(value: string | undefined, min: number, max: number, fallback: number): number {
  const n = value === undefined ? NaN : Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[]): T | null {
  return allowed.includes(value as T) ? (value as T) : null;
}

/** Reads `?lat&lng&z&category&size`; anything missing or invalid falls back to the defaults (Poland, Medium). */
export function parseSearch(params: Params): SearchState {
  return {
    lat: num(first(params.lat), -85, 85, DEFAULT_SEARCH.lat),
    lng: num(first(params.lng), -180, 180, DEFAULT_SEARCH.lng),
    zoom: num(first(params.z), 2, 19, DEFAULT_SEARCH.zoom),
    category: oneOf(first(params.category), Object.values(ServiceCategory)),
    size: oneOf(first(params.size), Object.values(VehicleSize)) ?? DEFAULT_SEARCH.size,
  };
}

/** The query string for a state; defaults are left out so the plain home page stays `/`. */
export function serializeSearch(state: SearchState): string {
  const params = new URLSearchParams();
  const atDefaultView =
    state.lat === DEFAULT_SEARCH.lat && state.lng === DEFAULT_SEARCH.lng && state.zoom === DEFAULT_SEARCH.zoom;
  if (!atDefaultView) {
    params.set('lat', state.lat.toFixed(4));
    params.set('lng', state.lng.toFixed(4));
    params.set('z', state.zoom.toFixed(1));
  }
  if (state.category) params.set('category', state.category);
  if (state.size !== DEFAULT_SEARCH.size) params.set('size', state.size);
  return params.toString();
}
