'use client';

import Map, { GeolocateControl, Marker, NavigationControl } from 'react-map-gl/maplibre';
import { MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';
import './worker';
import { POLAND_VIEW, roundCoord, type LatLng } from './geo';
import { useMapStyle } from './useMapStyle';

export interface MapPickerProps {
  /** The pin, or null before one is placed. */
  value: LatLng | null;
  onChange: (point: LatLng) => void;
  /** Show the pin without letting anyone move it. */
  readOnly?: boolean;
  /** A style of the app's own; without it the map follows the theme (positron or dark). */
  styleUrl?: string;
  /** CSS height of the map. */
  height?: number | string;
}

/** A map to place one pin: click to put it, drag to move it, or use the location button. */
export function MapPicker({ value, onChange, readOnly = false, styleUrl, height = 320 }: MapPickerProps) {
  const mapStyle = useMapStyle(styleUrl);
  const pick = (lat: number, lng: number) => onChange({ lat: roundCoord(lat), lng: roundCoord(lng) });
  const initialViewState = value
    ? { latitude: value.lat, longitude: value.lng, zoom: 15 }
    : { latitude: POLAND_VIEW.lat, longitude: POLAND_VIEW.lng, zoom: POLAND_VIEW.zoom };

  return (
    <div className="overflow-hidden rounded-lg border border-border" style={{ height }}>
      <Map
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        style={{ width: '100%', height: '100%' }}
        cursor={readOnly ? 'grab' : 'crosshair'}
        onClick={readOnly ? undefined : (e) => pick(e.lngLat.lat, e.lngLat.lng)}
      >
        <NavigationControl position="top-right" showCompass={false} />
        {!readOnly && (
          <GeolocateControl position="top-right" onGeolocate={(e) => pick(e.coords.latitude, e.coords.longitude)} />
        )}
        {value && (
          <Marker
            latitude={value.lat}
            longitude={value.lng}
            anchor="bottom"
            draggable={!readOnly}
            onDragEnd={(e) => pick(e.lngLat.lat, e.lngLat.lng)}
          >
            <MapPin
              size={36}
              strokeWidth={1.5}
              className="fill-primary text-primary-foreground drop-shadow-md"
              aria-label="Pinezka studia"
            />
          </Marker>
        )}
      </Map>
    </div>
  );
}
