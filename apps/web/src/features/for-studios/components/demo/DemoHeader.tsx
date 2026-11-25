import type { ReactNode } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '@detaileed/ui';

interface DemoHeaderProps {
  title: string;
  subtitle: ReactNode;
  /** Defaults to the dashboard's "Nowy klient" and "Nowa rezerwacja" buttons. */
  actions?: ReactNode;
}

/**
 * The demo's copy of the dashboard's page header (`PageHeader`). The landing page has one h1 (the hero), so the title
 * here is an h3 under the demo section's h2; that is why it doesn't use `PageHeader`, which always renders an h1.
 */
export function DemoHeader({ title, subtitle, actions }: DemoHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h3>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {actions ?? (
          <>
            <Button variant="secondary" icon={UserPlus}>
              Nowy klient
            </Button>
            <Button icon={Plus}>Nowa rezerwacja</Button>
          </>
        )}
      </div>
    </header>
  );
}
