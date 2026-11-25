'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, type LucideIcon } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ThemeSwitch,
} from '@detaileed/ui';

export interface NavMenuLink {
  href: string;
  label: string;
  icon?: LucideIcon;
}

/**
 * The header's links and the theme switch behind a menu button, for phones and small tablets, where the header has no
 * room for them. The caller hides it from the width where the links show in the header itself.
 */
export function NavMenu({ links, className }: { links: readonly NavMenuLink[]; className?: string }) {
  const pathname = usePathname();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm" icon={Menu} aria-label="Menu" className={className} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-60">
        {links.map((link) => (
          <DropdownMenuItem key={link.href} icon={link.icon} asChild className="h-10">
            <Link href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Motyw</DropdownMenuLabel>
        <div className="px-1 pb-1">
          <ThemeSwitch size="md" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
