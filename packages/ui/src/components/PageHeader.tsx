import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export interface PageHeaderProps {
  title: ReactNode;
  /** One line under the title in `muted-foreground`. */
  description?: ReactNode;
  /** Buttons on the right (one primary at most); they wrap below the title on phones. */
  actions?: ReactNode;
  /** Shown above the title, e.g. a breadcrumb `<nav>`. */
  breadcrumb?: ReactNode;
  className?: string;
}

/** The top of a screen: optional breadcrumb, the page's `<h1>`, a description and the page actions. */
export function PageHeader({ title, description, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        {breadcrumb && <div className="text-sm text-muted-foreground">{breadcrumb}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
