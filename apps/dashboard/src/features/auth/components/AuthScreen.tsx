import React from 'react';
import { Card, LogoMark, cn } from '@detaileed/ui';

interface AuthScreenProps {
  title: string;
  description?: React.ReactNode;
  /** Extra classes for the card's body (layout only). */
  className?: string;
  children?: React.ReactNode;
}

/** A full-page screen outside the studio: the logo, the screen's title and one centred card on the page background. */
export const AuthScreen: React.FC<AuthScreenProps> = ({ title, description, className, children }) => (
  <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoMark size={36} className="text-foreground" />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children && <Card className={cn('flex flex-col gap-5 p-6', className)}>{children}</Card>}
    </div>
  </main>
);
