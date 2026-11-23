import Link from 'next/link';
import { cn, Logo, ThemeSwitch } from '@detaileed/ui';
import { DASHBOARD_URL } from '@/shared/lib/site';
import { column, focusLink } from './landingStyles';

const linkClass = cn(
  'self-start rounded-sm text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground',
  focusLink,
);

/** The footer: the logo and tagline, the product and customer links, the copyright and (on phones) the theme switch. */
export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-subtle">
      <div className={cn(column, 'grid gap-10 py-12 sm:grid-cols-[2fr_1fr_1fr]')}>
        <div className="flex max-w-xs flex-col gap-3">
          <Link href="/for-studios" className={cn('self-start rounded-md text-foreground', focusLink)}>
            <Logo size={22} />
          </Link>
          <p className="text-sm text-muted-foreground">
            Studio OS zaprojektowany specjalnie dla branży detailingu. Prosty, szybki, bezpieczny.
          </p>
        </div>
        <nav aria-labelledby="footer-product" className="flex flex-col gap-2.5">
          <h2 id="footer-product" className="text-sm font-medium text-foreground">
            Produkt
          </h2>
          <a href="#features" className={linkClass}>
            Funkcje
          </a>
          <a href="#pricing" className={linkClass}>
            Cennik
          </a>
          <a href={DASHBOARD_URL} className={linkClass}>
            Panel studia
          </a>
        </nav>
        <nav aria-labelledby="footer-customers" className="flex flex-col gap-2.5">
          <h2 id="footer-customers" className="text-sm font-medium text-foreground">
            Dla klientów
          </h2>
          <Link href="/" className={linkClass}>
            Szukaj studia na mapie
          </Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <div
          className={cn(
            column,
            'flex flex-col gap-4 py-6 text-sm text-faint sm:flex-row sm:items-center sm:justify-between',
          )}
        >
          <p>© {new Date().getFullYear()} Detaileed. Wszelkie prawa zastrzeżone.</p>
          <div className="flex items-center justify-between gap-4">
            <p>Zbudowane z ❤️ dla detailerów</p>
            <ThemeSwitch iconOnly className="sm:hidden" />
          </div>
        </div>
      </div>
    </footer>
  );
}
