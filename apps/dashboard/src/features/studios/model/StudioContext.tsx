import React, { createContext, useContext } from 'react';
import type { Studio } from '@/features/studios/model/types';
import { DEFAULT_TIME_ZONE } from '@/shared/lib/studioTime';

const StudioContext = createContext<Studio | null>(null);

/** Provides the studio from the URL (`/s/$studioId`) to the screens below it. */
export const StudioScope: React.FC<{ studio: Studio; children: React.ReactNode }> = ({ studio, children }) => (
  <StudioContext.Provider value={studio}>{children}</StudioContext.Provider>
);

/** The studio of the current `/s/$studioId` route, or null outside of it. */
// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs next to its context
export function useStudio(): { selectedStudio: Studio | null } {
  return { selectedStudio: useContext(StudioContext) };
}

/** The current studio's IANA time zone (Europe/Warsaw outside a studio or when the API sends none). */
// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs next to its context
export function useStudioTimeZone(): string {
  return useContext(StudioContext)?.timeZone || DEFAULT_TIME_ZONE;
}
