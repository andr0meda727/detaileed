import Link from 'next/link';
import { Button, cn, Logo, ThemeSwitch } from '@detaileed/ui';
import { DASHBOARD_URL } from '@/shared/lib/site';
import { NavMenu } from '@/shared/ui/NavMenu';
import { column, focusLink } from './landingStyles';

const LINKS = [
  { href: '#demo', label: 'Demo' },
  { href: '#features', label: 'Funkcje' },
  { href: '#how', label: 'Jak to działa' },
  { href: '#pricing', label: 'Cennik' },
];

/**
 * Sticky top bar: the logo, the section links and the theme switch (from md up, below in a menu button) and the
 * sign-up button.
 */
export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <nav aria-label="Główna" className={cn(column, 'flex h-14 items-center gap-6')}>
        <Link href="/for-studios" className={cn('shrink-0 rounded-md text-foreground', focusLink)}>
          <Logo size={22} />
        </Link>
        <ul className="flex items-center gap-1 max-md:hidden">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground',
                  focusLink,
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitch iconOnly className="max-md:hidden" />
          <Button asChild size="sm">
            <a href={DASHBOARD_URL}>Zacznij za darmo</a>
          </Button>
          <NavMenu links={LINKS} className="md:hidden" />
        </div>
      </nav>
    </header>
  );
}
