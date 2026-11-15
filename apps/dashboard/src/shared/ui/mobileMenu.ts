import { createContext, useContext } from 'react';

/** Opens the sidebar on small screens; provided by the studio layout route. */
export const MobileMenuContext = createContext<(() => void) | null>(null);

export function useOpenMobileMenu(): (() => void) | null {
  return useContext(MobileMenuContext);
}
