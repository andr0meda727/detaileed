import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';
import { Card } from './Card';

interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  /** A neutral icon tile (default) or a warning-toned one; it changes only the tile. */
  tone?: 'dark' | 'amber';
  /** Rendered on the right of the header, e.g. a mode toggle or a counter. */
  actions?: ReactNode;
  /** The section's body; it brings its own padding. */
  children: ReactNode;
}

/** A card with an icon + title header, used to group the steps of a longer form. */
export function FormSection({ icon: Icon, title, tone = 'dark', actions, children }: FormSectionProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-md',
              tone === 'amber' ? 'bg-warning-soft text-warning' : 'bg-muted text-foreground',
            )}
          >
            <Icon size={16} strokeWidth={1.75} aria-hidden />
          </div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {actions}
      </div>
      {children}
    </Card>
  );
}
