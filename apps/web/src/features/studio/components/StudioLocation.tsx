'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@detaileed/ui';
import { MAP_STYLE_URL } from '@/shared/lib/site';

const MapView = dynamic(() => import('@detaileed/ui/map').then((m) => m.MapView), {
  ssr: false,
  loading: () => <Skeleton width="100%" height="100%" className="rounded-2xl" />,
});

/** A small map with the studio's pin and a link to directions. */
export default function StudioLocation({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  return (
    <div className="space-y-2">
      <div className="h-56">
        <MapView
          pins={[{ id: 'studio', lat, lng, label: name }]}
          initialView={{ lat, lng, zoom: 14 }}
          styleUrl={MAP_STYLE_URL}
          height="100%"
        />
      </div>
      <a
        href={`https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-semibold text-green-light hover:text-green-deep underline"
      >
        Wyznacz trasę
      </a>
    </div>
  );
}
