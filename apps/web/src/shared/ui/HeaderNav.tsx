'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@detaileed/ui';

const LINKS = [
  { href: '/', label: 'Szukaj na mapie' },
  { href: '/for-studios', label: 'Dla studiów' },
];

/** The header's main links (hidden on phones, where the footer carries them). */
export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Główne" className="flex items-center gap-5 text-sm max-md:hidden">
      {LINKS.map((link) => {
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
