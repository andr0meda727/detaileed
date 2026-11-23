'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { MAP_STYLES } from '@detaileed/ui/map/geo';
import { GallerySection } from './section';

const MapView = dynamic(() => import('@detaileed/ui/map').then((m) => m.MapView), { ssr: false });
const MapPicker = dynamic(() => import('@detaileed/ui/map').then((m) => m.MapPicker), { ssr: false });

const pins = [
  { id: 'a', lat: 52.2297, lng: 21.0122, label: 'od 89 zł' },
  { id: 'b', lat: 52.2, lng: 20.95, label: 'od 120 zł' },
  { id: 'c', lat: 52.25, lng: 21.07, label: 'od 150 zł' },
];

/**
 * Maps follow the page theme by themselves; here each panel passes its own style, so both styles show at once.
 */
export function MapSection({ theme }: { theme: 'light' | 'dark' }) {
  const [selected, setSelected] = useState<string | null>('b');
  const [point, setPoint] = useState({ lat: 52.2297, lng: 21.0122 });
  return (
    <GallerySection title="MapView i MapPicker">
      <MapView
        pins={pins}
        selectedId={selected}
        onPinClick={setSelected}
        initialView={{ lat: 52.225, lng: 21.01, zoom: 10.5 }}
        styleUrl={MAP_STYLES[theme]}
        height={280}
      />
      <MapPicker value={point} onChange={setPoint} styleUrl={MAP_STYLES[theme]} height={200} />
    </GallerySection>
  );
}
