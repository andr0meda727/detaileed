import React, { createContext, useContext } from 'react';
import { StudioDto } from '../types';
import { getActiveStudioId } from '../app/activeStudio';

const StudioContext = createContext<StudioDto | null>(null);

/** Provides the studio from the URL (`/s/$studioId`) to the screens below it. */
export const StudioScope: React.FC<{ studio: StudioDto; children: React.ReactNode }> = ({ studio, children }) => (
  <StudioContext.Provider value={studio}>{children}</StudioContext.Provider>
);

/** The studio of the current `/s/$studioId` route, or null outside of it. */
// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs next to its context
export function useStudio(): { selectedStudio: StudioDto | null } {
  return { selectedStudio: useContext(StudioContext) };
}

/** Studio the API calls work in (see app/activeStudio.ts). */
// eslint-disable-next-line react-refresh/only-export-components -- read by the legacy api client
export function getSelectedStudioId(): string | null {
  return getActiveStudioId();
}
