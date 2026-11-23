import type { ReactNode } from 'react';
import { Card, LogoMark } from '@detaileed/ui';

/** The title and card of a sign-in or password page; the `(auth)` layout provides the column around it. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <>
      <LogoMark size={32} className="text-foreground" />
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-muted-foreground">{subtitle}</p>}
      <Card className="mt-6 p-5 sm:p-6">{children}</Card>
    </>
  );
}
