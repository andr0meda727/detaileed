/** Settings from the build environment (see .env.example). */

/** MapLibre style for maps; undefined = the ui package's default (OpenFreeMap). */
export const MAP_STYLE_URL: string | undefined = import.meta.env.VITE_MAP_STYLE_URL || undefined;

/** Origin of the customer site (detaileed.com), for links to a studio's public page. */
export const WEB_URL: string = (import.meta.env.VITE_WEB_URL || 'https://detaileed.com').replace(/\/+$/, '');

/** A studio's public page on the customer site. */
export const publicStudioUrl = (studioId: string) => `${WEB_URL}/studio/${studioId}`;
