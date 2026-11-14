import React, { createContext, useContext } from 'react';
import type { Studio } from '@/features/studios/model/types';
import { getActiveStudioId } from '@/features/studios/model/activeStudio';

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

/** Studio the API calls work in (see app/activeStudio.ts). */
// eslint-disable-next-line react-refresh/only-export-components -- read by the legacy api client
export function getSelectedStudioId(): string | null {
  return getActiveStudioId();
}
