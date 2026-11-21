/**
 * Public API of a studio's public page. Server-only data loading is in `./server` (`@/features/studio/server`), so
 * importing this entry from a browser component never pulls it in.
 */
export { StudioHeader } from './components/StudioHeader';
export { StudioLocation } from './components/StudioLocation';
export { StudioOffer } from './components/StudioOffer';
export { ReviewsList } from './components/ReviewsList';
export { studioJsonLd } from './model/jsonLd';
