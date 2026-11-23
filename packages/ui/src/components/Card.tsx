import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type CardProps = HTMLAttributes<HTMLDivElement>;

/** A bordered panel on `surface`, no shadow. Compose it with `CardHeader`, `CardContent` and `CardFooter`. */
export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-lg border border-border bg-surface text-foreground', className)} {...props} />;
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  description?: ReactNode;
  /** Rendered on the right: a link, a button, a filter. */
  actions?: ReactNode;
  /** Heading level of the title (default h2). */
  titleAs?: 'h2' | 'h3' | 'h4';
}

/** The card's header row: title, an optional description below it, actions on the right; a border below. */
export function CardHeader({
  title,
  description,
  actions,
  titleAs: Title = 'h2',
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border px-5 py-3.5',
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex min-w-0 flex-col gap-0.5">
          {title && <Title className="text-sm font-semibold text-foreground">{title}</Title>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** The card's body, padded `p-5`. */
export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5', className)} {...props} />;
}

/** A row of actions at the bottom of the card, right-aligned (primary last), with a border above. */
export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-wrap items-center justify-end gap-2 border-t border-border px-5 py-3.5', className)}
      {...props}
    />
  );
}
