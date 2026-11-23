import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Button } from '@detaileed/ui';
import { SiteChrome } from './site-chrome';

// Rendered outside the (site) layout, so it adds the header and footer itself.
export default function NotFound() {
  return (
    <SiteChrome>
      <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center sm:py-28">
        <p className="font-mono text-sm text-faint tabular-nums">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Nie znaleźliśmy tej strony</h1>
        <p className="text-muted-foreground">
          Studio mogło zostać ukryte przez właściciela albo link jest nieaktualny.
        </p>
        <Button asChild icon={MapPin} className="mt-2">
          <Link href="/">Szukaj studia na mapie</Link>
        </Button>
      </section>
    </SiteChrome>
  );
}
