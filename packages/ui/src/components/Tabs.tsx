'use client';

import type { ComponentProps } from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';
import { cn } from '../lib/cn';
import { focusRingClass } from './interactiveStyles';

/**
 * Tabs with an underline, on Radix Tabs: arrow keys move between triggers, Home/End jump to the ends. The list
 * scrolls sideways on narrow screens.
 *
 * For tabs kept in the URL, control `value` from the route and wrap each link in a trigger with `asChild`
 * (`<TabsTrigger value="ledger" asChild><Link to="…">Ruchy</Link></TabsTrigger>`); the route renders the content,
 * so `TabsContent` can be left out.
 */
export function Tabs({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root className={cn('flex flex-col gap-5', className)} {...props} />;
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex items-center gap-5 overflow-x-auto shadow-[inset_0_-1px_0_var(--border)]', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap border-b-2',
        'border-transparent text-sm font-medium text-muted-foreground transition-colors duration-150',
        'hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground',
        'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4',
        focusRingClass,
        // Inset, so the scrolling list doesn't clip the ring.
        'focus-visible:ring-inset focus-visible:ring-offset-0',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('rounded-md', focusRingClass, className)} {...props} />;
}
