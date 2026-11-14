import React, { Suspense } from 'react';

const Devtools = React.lazy(() =>
  import('@tanstack/react-router-devtools').then((m) => ({ default: m.TanStackRouterDevtools })),
);

/** Router devtools in dev only; the import is dropped from production builds. */
export function RouterDevtools() {
  if (!import.meta.env.DEV) return null;
  return (
    <Suspense>
      <Devtools position="bottom-right" />
    </Suspense>
  );
}
