'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * True in the browser, false while rendering on a server (Next.js). Portals into `document.body` wait for it, so
 * server rendering never touches `document`; it also avoids a hydration mismatch.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
