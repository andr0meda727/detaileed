'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Tooltip as TooltipPrimitive } from 'radix-ui';
import { cn } from '../lib/cn';

export interface TooltipProps {
  /** The hint; keep it short. */
  content: ReactNode;
  /** The trigger: one element that takes focus and a ref (a button, a link). */
  children: ReactNode;
  side?: ComponentProps<typeof TooltipPrimitive.Content>['side'];
  align?: ComponentProps<typeof TooltipPrimitive.Content>['align'];
  /** Milliseconds before it shows on hover; focus shows it at once. */
  delayDuration?: number;
  className?: string;
}

/**
 * A short hint on hover and keyboard focus, on Radix Tooltip (the trigger gets `aria-describedby`; Escape hides it).
 * It brings its own provider, so `<Tooltip content="Kopiuj link"><Button …/></Tooltip>` is all it takes. A tooltip is
 * extra: never the only place for information, and never on disabled buttons (they don't get focus). An icon-only
 * button still needs its own `aria-label`.
 */
export function Tooltip({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 300,
  className,
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={6}
            collisionPadding={8}
            className={cn(
              'z-120 max-w-64 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground shadow-lg',
              'motion-safe:animate-fade-in',
              className,
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
