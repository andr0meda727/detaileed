import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Gallery } from './gallery';

export const metadata: Metadata = { title: 'Komponenty', robots: { index: false, follow: false } };

/**
 * Dev-only gallery of the basic Grafit components (`@detaileed/ui`), in a light and a dark panel side by side.
 * Needs no API or Supabase; absent from production builds. The interactive components are on /dev/ui/interactive.
 */
export default function UiGalleryPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Gallery />;
}
