import type { ReactNode } from 'react';
import { SiteHeader } from '@/shared/ui/SiteHeader';
import { SiteFooter } from '@/shared/ui/SiteFooter';
import { AccountMenu } from '@/features/auth';

/** The customer site's header and footer around a page. The /for-studios landing page brings its own. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader accountSlot={<AccountMenu />} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
