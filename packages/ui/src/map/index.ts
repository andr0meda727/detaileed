/**
 * Maps (MapLibre). A separate entry point (`@detaileed/ui/map`) so apps without maps never load MapLibre; apps that use
 * it install `maplibre-gl` and `react-map-gl`.
 */
export { MapPicker } from './MapPicker';
export type { MapPickerProps } from './MapPicker';
export { MapView } from './MapView';
export type { MapPinItem, MapViewProps } from './MapView';
export { DEFAULT_MAP_STYLE, MAP_STYLES, POLAND_VIEW, roundBounds, roundCoord } from './geo';
export { useMapStyle } from './useMapStyle';
export type { Bounds, LatLng } from './geo';
