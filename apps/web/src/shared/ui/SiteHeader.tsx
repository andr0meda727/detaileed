import Link from 'next/link';

/** Top bar: logo home link, the link to the studio-owner landing page and the account link. */
export function SiteHeader({ accountSlot }: { accountSlot?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-xs border-b border-green-deep/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="font-serif text-2xl text-green-deep tracking-tight">
          Detaileed
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-semibold">
          <Link href="/for-studios" className="hidden sm:inline text-green-light hover:text-green-deep">
            Dla studiów
          </Link>
          {accountSlot}
        </nav>
      </div>
    </header>
  );
}
