'use client';

import dynamic from 'next/dynamic';
import { Navigation } from 'lucide-react';
import { Button, Skeleton } from '@detaileed/ui';
import { MAP_STYLE_URL } from '@/shared/lib/site';

const MapView = dynamic(() => import('@detaileed/ui/map').then((m) => m.MapView), {
  ssr: false,
  loading: () => <Skeleton width="100%" height="100%" className="rounded-none" />,
});

/** A card with a small map of the studio's pin and a link to directions. */
export function StudioLocation({ lat, lng, name }: { lat: number; lng: number; name: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {/* The map brings its own rounded border; inside the card the card's edge is enough. */}
      <div className="h-52 border-b border-border [&>div]:rounded-none [&>div]:border-0">
        <MapView
          pins={[{ id: 'studio', lat, lng, label: name }]}
          initialView={{ lat, lng, zoom: 14 }}
          styleUrl={MAP_STYLE_URL}
          height="100%"
        />
      </div>
      <div className="p-4">
        <Button asChild variant="secondary" fullWidth icon={Navigation}>
          <a href={`https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`} target="_blank" rel="noreferrer">
            Wyznacz trasę
          </a>
        </Button>
      </div>
    </div>
  );
}
