/** A point on the map. */
export interface LatLng {
  lat: number;
  lng: number;
}

/** The visible area of a map, as the public studio search takes it. */
export interface Bounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * OpenFreeMap's vector styles (free, no key): the quiet greys of positron in the light theme, dark in the dark one.
 * Maps pick one with the theme (`useMapStyle`); an app's own style URL (env var) overrides both.
 */
export const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;

/** The light style; kept for code that wants one fixed style. */
export const DEFAULT_MAP_STYLE: string = MAP_STYLES.light;

/** Roughly the middle of Poland, and a zoom that shows the whole country. */
export const POLAND_VIEW = { lat: 52.07, lng: 19.48, zoom: 5.3 };

/** A coordinate rounded to `digits` decimals (6 ≈ 0.1 m, enough for a studio's pin). */
export function roundCoord(value: number, digits = 6): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

/**
 * Bounds widened to `digits` decimals (mins down, maxes up), so tiny map moves produce the same query and the
 * API's 60-second cache is hit; the area never shrinks.
 */
export function roundBounds(b: Bounds, digits = 3): Bounds {
  const f = 10 ** digits;
  return {
    minLat: Math.floor(b.minLat * f) / f,
    maxLat: Math.ceil(b.maxLat * f) / f,
    minLng: Math.floor(b.minLng * f) / f,
    maxLng: Math.ceil(b.maxLng * f) / f,
  };
}
