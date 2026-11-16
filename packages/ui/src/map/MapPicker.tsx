'use client';

import Map, { GeolocateControl, Marker, NavigationControl } from 'react-map-gl/maplibre';
import { MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DEFAULT_MAP_STYLE, POLAND_VIEW, roundCoord, type LatLng } from './geo';

export interface MapPickerProps {
  /** The pin, or null before one is placed. */
  value: LatLng | null;
  onChange: (point: LatLng) => void;
  /** Show the pin without letting anyone move it. */
  readOnly?: boolean;
  styleUrl?: string;
  /** CSS height of the map. */
  height?: number | string;
}

/** A map to place one pin: click to put it, drag to move it, or use the location button. */
export default function MapPicker({
  value,
  onChange,
  readOnly = false,
  styleUrl = DEFAULT_MAP_STYLE,
  height = 320,
}: MapPickerProps) {
  const pick = (lat: number, lng: number) => onChange({ lat: roundCoord(lat), lng: roundCoord(lng) });
  const initialViewState = value
    ? { latitude: value.lat, longitude: value.lng, zoom: 15 }
    : { latitude: POLAND_VIEW.lat, longitude: POLAND_VIEW.lng, zoom: POLAND_VIEW.zoom };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height }}>
      <Map
        initialViewState={initialViewState}
        mapStyle={styleUrl}
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
            <MapPin size={36} className="text-green-deep fill-amber drop-shadow-md" aria-label="Pinezka studia" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
