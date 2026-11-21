'use client';

import { Button } from '@detaileed/ui';
import { SiteChrome } from './site-chrome';

/** Shown when a page fails to render (e.g. the API is down). It replaces the (site) layout, so it adds the header and footer. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SiteChrome>
      <section className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl">Coś poszło nie tak</h1>
        <p className="text-green-light">Nie udało się wczytać strony. Spróbuj ponownie za chwilę.</p>
        <Button onClick={reset}>Spróbuj ponownie</Button>
      </section>
    </SiteChrome>
  );
}
