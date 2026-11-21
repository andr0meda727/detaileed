import { SiteChrome } from '../site-chrome';

/** Every customer-site page (map, studios, sign-in, account) shares the site header and footer. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
