import Link from 'next/link';
import { Logo, ThemeSwitch } from '@detaileed/ui';
import { HeaderNav } from './HeaderNav';

/** Top bar: logo home link, the main links, the theme switch and the account slot. */
export function SiteHeader({ accountSlot }: { accountSlot?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-[1160px] items-center gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Logo size={22} />
        </Link>
        <HeaderNav />
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch iconOnly className="max-sm:hidden" />
          {accountSlot}
        </div>
      </div>
    </header>
  );
}
