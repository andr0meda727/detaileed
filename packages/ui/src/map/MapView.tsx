'use client';

import Map, { GeolocateControl, Marker, NavigationControl, type ViewStateChangeEvent } from 'react-map-gl/maplibre';
import type { Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DEFAULT_MAP_STYLE, POLAND_VIEW, type Bounds } from './geo';

export interface MapPinItem {
  id: string;
  lat: number;
  lng: number;
  /** Short text on the pin, e.g. "od 89 zł". */
  label?: string;
}

export interface MapViewProps {
  pins: MapPinItem[];
  selectedId?: string | null;
  onPinClick?: (id: string) => void;
  /** Called with the visible area once the map has loaded and after every move. */
  onBoundsChange?: (bounds: Bounds, view: { lat: number; lng: number; zoom: number }) => void;
  initialView?: { lat: number; lng: number; zoom: number };
  styleUrl?: string;
  height?: number | string;
  /** Show the "my location" button. */
  geolocate?: boolean;
}

function boundsOf(map: MaplibreMap): Bounds {
  const b = map.getBounds();
  return { minLat: b.getSouth(), maxLat: b.getNorth(), minLng: b.getWest(), maxLng: b.getEast() };
}

/** A map with labelled pins (studios), reporting the visible area so a list can follow it. */
export function MapView({
  pins,
  selectedId,
  onPinClick,
  onBoundsChange,
  initialView = POLAND_VIEW,
  styleUrl = DEFAULT_MAP_STYLE,
  height = 480,
  geolocate = false,
}: MapViewProps) {
  const report = (map: MaplibreMap) => {
    if (!onBoundsChange) return;
    const c = map.getCenter();
    onBoundsChange(boundsOf(map), { lat: c.lat, lng: c.lng, zoom: map.getZoom() });
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height }}>
      <Map
        initialViewState={{ latitude: initialView.lat, longitude: initialView.lng, zoom: initialView.zoom }}
        mapStyle={styleUrl}
        style={{ width: '100%', height: '100%' }}
        onLoad={(e) => report(e.target)}
        onMoveEnd={(e: ViewStateChangeEvent) => report(e.target)}
      >
        <NavigationControl position="top-right" showCompass={false} />
        {geolocate && <GeolocateControl position="top-right" />}
        {pins.map((pin) => {
          const selected = pin.id === selectedId;
          return (
            <Marker key={pin.id} latitude={pin.lat} longitude={pin.lng} anchor="bottom">
              <button
                type="button"
                onClick={() => onPinClick?.(pin.id)}
                aria-pressed={selected}
                className={[
                  'px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md border-2 whitespace-nowrap transition-transform',
                  selected
                    ? 'bg-amber text-green-deep border-white scale-110'
                    : 'bg-green-deep text-cream-warm border-white hover:scale-105',
                ].join(' ')}
              >
                {pin.label ?? '•'}
              </button>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
