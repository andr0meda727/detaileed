import type { ReactNode } from 'react';
import { SearchX, type LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';

export interface EmptyStateProps {
  /** One sentence: what's missing and, if useful, what to do. */
  message?: string;
  /** An optional short heading above the message. */
  title?: string;
  icon?: LucideIcon;
  /** One action, e.g. a `Button` that adds the first item. */
  action?: ReactNode;
  className?: string;
}

/** Shown when a list or table has nothing to display: an icon in a muted circle, a sentence, one action. */
export function EmptyState({
  message = 'Brak danych',
  title,
  icon: Icon = SearchX,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-4 py-12 text-center', className)}>
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon size={18} strokeWidth={1.75} aria-hidden />
      </div>
      <div className="flex max-w-sm flex-col gap-1">
        {title && <p className="text-sm font-medium text-foreground">{title}</p>}
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
