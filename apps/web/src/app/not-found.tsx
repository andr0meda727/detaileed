import Link from 'next/link';
import { SiteChrome } from './site-chrome';

// Rendered outside the (site) layout, so it adds the header and footer itself.
export default function NotFound() {
  return (
    <SiteChrome>
      <section className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-6xl font-serif text-green-light">404</p>
        <h1 className="font-serif text-3xl">Nie znaleźliśmy tej strony</h1>
        <p className="text-green-light">Studio mogło zostać ukryte przez właściciela albo link jest nieaktualny.</p>
        <Link
          href="/"
          className="inline-block px-5 py-3.5 rounded-xl bg-green-deep text-cream-warm text-[11px] font-bold uppercase tracking-widest"
        >
          Szukaj studia na mapie
        </Link>
      </section>
    </SiteChrome>
  );
}
