import { setWorkerUrl } from 'maplibre-gl';

/**
 * MapLibre looks for its worker next to its own module (`new URL('./maplibre-gl-worker.mjs', import.meta.url)`), which
 * fails once a bundler has moved it: Turbopack (Next.js) gives it a `file://` url, so it gives up, and a Vite build puts
 * it in a hashed chunk with no worker beside it. Both blank the map. Naming the worker file here with a static
 * `new URL(…, import.meta.url)` makes Turbopack and Vite emit it as an asset and hand us its served url.
 */
setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href);
