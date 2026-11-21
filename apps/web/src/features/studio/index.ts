/**
 * Public API of a studio's public page. Server-only data loading is in `./server` (`@/features/studio/server`), so
 * importing this entry from a browser component never pulls it in.
 */
export { default as StudioHeader } from './components/StudioHeader';
export { default as StudioLocation } from './components/StudioLocation';
export { default as StudioOffer } from './components/StudioOffer';
export { default as ReviewsList } from './components/ReviewsList';
export { studioJsonLd } from './model/jsonLd';
