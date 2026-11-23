import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InteractiveGallery } from './gallery';

export const metadata: Metadata = { title: 'Komponenty interaktywne', robots: { index: false, follow: false } };

/** Dev-only gallery of the Radix-based components of `@detaileed/ui`, in a light and a dark panel. */
export default function InteractiveGalleryPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <InteractiveGallery />;
}
