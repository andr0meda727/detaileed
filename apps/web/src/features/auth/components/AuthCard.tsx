import type { ReactNode } from 'react';

/** The title and card of a sign-in or password page; the `(auth)` layout provides the column around it. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <>
      <h1 className="font-serif text-4xl tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-green-light">{subtitle}</p>}
      <div className="mt-8 floating-card-static p-6 sm:p-8">{children}</div>
    </>
  );
}
