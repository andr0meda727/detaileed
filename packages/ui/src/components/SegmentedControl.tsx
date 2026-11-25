'use client';

import { ToggleGroup } from 'radix-ui';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../lib/cn';
import { focusRingClass } from './interactiveStyles';

export type SegmentedControlSize = 'sm' | 'md';

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

/** The control needs a name: a visible label (`aria-labelledby`) or `aria-label`. */
type AccessibleName =
  { 'aria-label': string; 'aria-labelledby'?: never } | { 'aria-labelledby': string; 'aria-label'?: never };

export type SegmentedControlProps<T extends string> = AccessibleName & {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** `md` is 36px high (filters), `sm` 32px (inside cards and toolbars). */
  size?: SegmentedControlSize;
  /** Stretch over the container's width, with equal segments. */
  fullWidth?: boolean;
  /** Show only the icons; the labels stay as the segments' accessible names. */
  iconOnly?: boolean;
  className?: string;
};

const heights: Record<SegmentedControlSize, string> = { sm: 'h-6.5 px-2.5', md: 'h-7.5 px-3' };

/**
 * A single choice among a few options shown side by side (filters, views, the theme), on Radix ToggleGroup:
 * a `radiogroup` with one tab stop, arrow keys move between segments, each segment is a `radio` named by its label. Clicking the active
 * segment keeps it selected.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  className,
  ...name
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(next) => {
        // Radix sends '' when the active segment is clicked again; a segmented control always has a choice.
        if (next) onValueChange(next as T);
      }}
      className={cn(
        'inline-flex max-w-full items-center gap-0.5 rounded-lg border border-border bg-subtle p-0.5',
        fullWidth && 'flex w-full',
        className,
      )}
      {...name}
    >
      {options.map(({ value: optionValue, label, icon: Icon, disabled }) => (
        <ToggleGroup.Item
          key={optionValue}
          value={optionValue}
          disabled={disabled}
          aria-label={iconOnly ? label : undefined}
          className={cn(
            'inline-flex min-w-0 items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap',
            'text-muted-foreground transition-colors duration-150 hover:text-foreground',
            'data-[state=on]:bg-muted data-[state=on]:text-foreground data-[state=on]:inset-ring',
            'data-[state=on]:inset-ring-border-strong disabled:pointer-events-none disabled:opacity-50',
            focusRingClass,
            'focus-visible:ring-offset-subtle',
            heights[size],
            fullWidth && 'flex-1',
          )}
        >
          {Icon && <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />}
          {!iconOnly && <span className="truncate">{label}</span>}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
