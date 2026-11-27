'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map as MapIcon, Store } from 'lucide-react';
import { cn } from '@detaileed/ui';
import { NavMenu, type NavMenuLink } from './NavMenu';

const SITE_LINKS: readonly NavMenuLink[] = [
  { href: '/', label: 'Szukaj na mapie', icon: MapIcon },
  { href: '/for-studios', label: 'Dla studiów', icon: Store },
];

/** The header's main links from `md` up (below, the header's menu button carries them). */
export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Główne" className="flex items-center gap-5 text-sm max-md:hidden">
      {SITE_LINKS.map((link) => {
        const current = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'rounded-sm transition-colors duration-150 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              current ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** The same links and the theme switch behind a menu button, for the header below `md`. */
export function HeaderMenu({ className }: { className?: string }) {
  return <NavMenu links={SITE_LINKS} className={className} />;
}
