'use client';

import Map, { GeolocateControl, Marker, NavigationControl, type ViewStateChangeEvent } from 'react-map-gl/maplibre';
import type { Map as MaplibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './worker';
import { cn } from '../lib/cn';
import { focusRing } from '../lib/focusRing';
import { POLAND_VIEW, type Bounds } from './geo';
import { useMapStyle } from './useMapStyle';

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
  /** A style of the app's own; without it the map follows the theme (positron or dark). */
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
  styleUrl,
  height = 480,
  geolocate = false,
}: MapViewProps) {
  const mapStyle = useMapStyle(styleUrl);
  const report = (map: MaplibreMap) => {
    if (!onBoundsChange) return;
    const c = map.getCenter();
    onBoundsChange(boundsOf(map), { lat: c.lat, lng: c.lng, zoom: map.getZoom() });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border" style={{ height }}>
      <Map
        initialViewState={{ latitude: initialView.lat, longitude: initialView.lng, zoom: initialView.zoom }}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        onLoad={(e) => report(e.target)}
        onMoveEnd={(e: ViewStateChangeEvent) => report(e.target)}
      >
        <NavigationControl position="top-right" showCompass={false} />
        {geolocate && <GeolocateControl position="top-right" />}
        {pins.map((pin) => {
          const selected = pin.id === selectedId;
          return (
            <Marker
              key={pin.id}
              latitude={pin.lat}
              longitude={pin.lng}
              anchor="bottom"
              style={selected ? { zIndex: 1 } : undefined}
            >
              <button
                type="button"
                onClick={() => onPinClick?.(pin.id)}
                aria-pressed={selected}
                className={cn(
                  'flex h-7 items-center whitespace-nowrap rounded-full border px-2.5 text-xs font-medium tabular-nums shadow-md',
                  'transition-colors duration-150',
                  focusRing,
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border-strong bg-surface text-foreground hover:bg-muted',
                )}
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
