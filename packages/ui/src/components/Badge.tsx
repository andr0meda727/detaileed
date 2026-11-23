import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Status tones (see the status → tone map in docs/design-system.md). */
export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /**
   * Any CSS colour (e.g. a status colour from the API). It colours only the dot, on a neutral pill, so the text
   * keeps its contrast in both themes; overrides `tone`.
   */
  color?: string | null;
  size?: BadgeSize;
  /** The 6px dot before the text (default on). */
  dot?: boolean;
  className?: string;
}

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
};

const sizes: Record<BadgeSize, string> = {
  sm: 'h-5 px-1.5 text-xs',
  md: 'h-5.5 px-2 text-xs',
  lg: 'h-6 px-2.5 text-sm',
};

/** A status pill with a dot: a booking status, a role, a stock level. Tinted by `tone`, or dotted by `color`. */
export function Badge({ children, tone = 'neutral', color, size = 'md', dot = true, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium',
        sizes[size],
        tones[color ? 'neutral' : tone],
        className,
      )}
    >
      {dot && (
        <span
          aria-hidden
          data-slot="dot"
          className={cn('size-1.5 shrink-0 rounded-full', !color && 'bg-current')}
          style={color ? { backgroundColor: color } : undefined}
        />
      )}
      {children}
    </span>
  );
}
