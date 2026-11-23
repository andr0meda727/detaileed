'use client';

import { RefreshCw } from 'lucide-react';
import { Alert, Button } from '@detaileed/ui';
import { SiteChrome } from './site-chrome';

/** Shown when a page fails to render (e.g. the API is down). It replaces the (site) layout, so it adds the header and footer. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SiteChrome>
      <section className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-20 sm:py-28">
        <h1 className="text-2xl font-semibold tracking-tight">Coś poszło nie tak</h1>
        <Alert
          tone="danger"
          title="Nie udało się wczytać strony"
          action={
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reset}>
              Spróbuj ponownie
            </Button>
          }
        >
          Spróbuj ponownie za chwilę.
        </Alert>
      </section>
    </SiteChrome>
  );
}
