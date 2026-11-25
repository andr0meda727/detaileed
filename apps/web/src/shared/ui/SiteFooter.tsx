import Link from 'next/link';
import { LogoMark, ThemeSwitch } from '@detaileed/ui';
import { DASHBOARD_URL } from '@/shared/lib/site';

// On phones the links get a 40px-high touch target.
const linkClass = 'inline-flex items-center transition-colors duration-150 hover:text-foreground max-md:min-h-10';

/** A quiet footer: the links of the header, the panel for studios and on phones the theme switch. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-subtle">
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark size={18} className="text-foreground" />
          <p>© {new Date().getFullYear()} Detaileed: studia detailingu w Twojej okolicy.</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
          <nav aria-label="Stopka" className="flex flex-wrap gap-x-5 md:gap-y-2">
            <Link href="/" className={linkClass}>
              Szukaj studia
            </Link>
            <Link href="/for-studios" className={linkClass}>
              Dla studiów
            </Link>
            <a href={DASHBOARD_URL} className={linkClass}>
              Panel dla studiów
            </a>
          </nav>
          <ThemeSwitch iconOnly size="md" className="sm:hidden" />
        </div>
      </div>
    </footer>
  );
}
