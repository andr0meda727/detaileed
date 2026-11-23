import type { HTMLAttributes } from 'react';
import { cn } from '../lib/cn';

/** A keyboard key or shortcut, e.g. `<Kbd>Esc</Kbd>`. */
export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-subtle px-1 font-mono text-xs text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
